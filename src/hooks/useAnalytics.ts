import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter, debounce } from '@/lib/rateLimiter';

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Генерируем или получаем session_id из sessionStorage
const getSessionId = (): string => {
  const SESSION_KEY = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Генерируем уникальный ID сессии
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

// Проверяем, returning visitor или нет
const isReturningVisitor = (): boolean => {
  const VISITOR_KEY = 'analytics_visitor_id';
  const existingVisitor = localStorage.getItem(VISITOR_KEY);
  
  if (!existingVisitor) {
    // Первый визит - сохраняем ID в localStorage
    const visitorId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(VISITOR_KEY, visitorId);
    return false;
  }
  
  return true;
};

// Подсчет страниц в сессии
const getPageCountInSession = (): number => {
  const COUNT_KEY = 'analytics_page_count';
  const count = parseInt(sessionStorage.getItem(COUNT_KEY) || '0', 10);
  sessionStorage.setItem(COUNT_KEY, String(count + 1));
  return count + 1;
};

export const usePageView = () => {
  const location = useLocation();
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const pageEntryTime = useRef<number>(Date.now());
  const pageViewId = useRef<string | null>(null);

  const debouncedTrackRef = useRef(
    debounce((pathname: string, search: string) => {
      // Rate limiting: максимум 1 page view в 2 секунды для одной страницы
      const key = `page-view:${pathname}`;
      if (!rateLimiter.canRequest(key, { maxRequests: 1, windowMs: 2000 })) {
        console.log('Page view rate limited:', pathname);
        return;
      }

      const searchParams = new URLSearchParams(search);
      const sessionId = getSessionId();
      const isReturning = isReturningVisitor();
      const pagesInSession = getPageCountInSession();
      
      supabase.from('page_views').insert({
        session_id: sessionId,
        page_path: pathname,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        referrer: document.referrer || null,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_term: searchParams.get('utm_term'),
        utm_content: searchParams.get('utm_content'),
        scroll_depth: 0,
        time_on_page: 0,
        is_returning: isReturning,
        pages_in_session: pagesInSession,
        is_bounce: false, // Будет обновлено при уходе
      }).select('id').single().then(({ data }) => {
        if (data) {
          pageViewId.current = data.id;
        }
      });
    }, 500)
  );

  // Отслеживание глубины прокрутки
  useEffect(() => {
    const handleScroll = debounce(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      if (scrollPercentage > maxScrollDepth) {
        setMaxScrollDepth(Math.min(scrollPercentage, 100));
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxScrollDepth]);

  // Обновление метрик при уходе со страницы
  useEffect(() => {
    const updateMetrics = () => {
      if (!pageViewId.current) return;

      const timeOnPage = Math.round((Date.now() - pageEntryTime.current) / 1000);
      const pagesInSession = getPageCountInSession();
      
      supabase
        .from('page_views')
        .update({
          scroll_depth: maxScrollDepth,
          time_on_page: timeOnPage,
          is_bounce: pagesInSession === 1 && timeOnPage < 10, // Bounce если 1 страница и меньше 10 сек
        })
        .eq('id', pageViewId.current);
    };

    window.addEventListener('beforeunload', updateMetrics);
    return () => {
      updateMetrics();
      window.removeEventListener('beforeunload', updateMetrics);
    };
  }, [maxScrollDepth]);

  useEffect(() => {
    // Обновление метрик предыдущей страницы при переходе
    if (pageViewId.current) {
      const timeOnPage = Math.round((Date.now() - pageEntryTime.current) / 1000);
      const pagesInSession = parseInt(sessionStorage.getItem('analytics_page_count') || '1', 10);
      
      supabase
        .from('page_views')
        .update({
          scroll_depth: maxScrollDepth,
          time_on_page: timeOnPage,
          is_bounce: pagesInSession === 1 && timeOnPage < 10,
        })
        .eq('id', pageViewId.current);
    }
    
    // Сброс метрик при смене страницы
    pageEntryTime.current = Date.now();
    setMaxScrollDepth(0);
    pageViewId.current = null;
    
    // Debounced tracking для предотвращения множественных вызовов при быстрой навигации
    debouncedTrackRef.current(location.pathname, location.search);
  }, [location.pathname, location.search]);
};

// Функция для отслеживания событий воронки
export const trackFunnelEvent = async (
  eventName: string,
  eventData?: Record<string, any>
) => {
  try {
    const key = `funnel-event:${eventName}:${window.location.pathname}`;
    if (!rateLimiter.canRequest(key, { maxRequests: 5, windowMs: 5000 })) {
      console.log('Funnel event rate limited:', eventName);
      return;
    }

    const sessionId = getSessionId();
    console.log('Tracking funnel event:', { eventName, path: window.location.pathname, sessionId });
    
    await supabase.from('funnel_events').insert({
      session_id: sessionId,
      page_path: window.location.pathname,
      event_name: eventName,
      event_data: eventData || null,
    });
  } catch (error) {
    console.error('Error tracking funnel event:', error);
  }
};

export const trackButtonClick = async (
  buttonName: string,
  buttonType: 'purchase' | 'contact' | 'link' = 'link'
) => {
  try {
    // Rate limiting: максимум 3 клика по одной кнопке в 5 секунд
    const key = `button-click:${buttonName}:${window.location.pathname}`;
    if (!rateLimiter.canRequest(key, { maxRequests: 3, windowMs: 5000 })) {
      console.log('Button click rate limited:', buttonName);
      return;
    }

    const sessionId = getSessionId();
    console.log('Tracking button click:', { buttonName, buttonType, path: window.location.pathname, sessionId });
    
    await supabase.from('button_clicks').insert({
      session_id: sessionId,
      button_name: buttonName,
      page_path: window.location.pathname,
      button_type: buttonType,
    });
  } catch (error) {
    console.error('Error tracking button click:', error);
  }
};
