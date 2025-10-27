import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

export const usePageView = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view in background without blocking render
    const searchParams = new URLSearchParams(location.search);
    
    // Fire and forget - don't block rendering
    supabase.from('page_views').insert({
      page_path: location.pathname,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      referrer: document.referrer || null,
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_term: searchParams.get('utm_term'),
      utm_content: searchParams.get('utm_content'),
    });
  }, [location.pathname, location.search]);
};

export const trackButtonClick = async (
  buttonName: string,
  buttonType: 'purchase' | 'contact' | 'link' = 'link'
) => {
  try {
    console.log('Tracking button click:', { buttonName, buttonType, path: window.location.pathname });
    
    await supabase.from('button_clicks').insert({
      button_name: buttonName,
      page_path: window.location.pathname,
      button_type: buttonType,
    });
  } catch (error) {
    console.error('Error tracking button click:', error);
  }
};
