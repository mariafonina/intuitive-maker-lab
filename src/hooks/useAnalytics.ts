import { useEffect, useRef } from 'react';
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

export const usePageView = () => {
  const location = useLocation();
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
      });
    }, 500)
  );

  useEffect(() => {
    // Debounced tracking для предотвращения множественных вызовов при быстрой навигации
    debouncedTrackRef.current(location.pathname, location.search);
  }, [location.pathname, location.search]);
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
