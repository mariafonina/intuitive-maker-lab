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
    const trackPageView = async () => {
      try {
        // Extract UTM parameters from URL
        const searchParams = new URLSearchParams(location.search);
        const utmSource = searchParams.get('utm_source');
        const utmMedium = searchParams.get('utm_medium');
        const utmCampaign = searchParams.get('utm_campaign');
        const utmTerm = searchParams.get('utm_term');
        const utmContent = searchParams.get('utm_content');

        await supabase.from('page_views').insert({
          page_path: location.pathname,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          referrer: document.referrer || null,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_term: utmTerm,
          utm_content: utmContent,
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname, location.search]);
};

export const trackButtonClick = async (
  buttonName: string,
  buttonType: 'purchase' | 'contact' | 'link' = 'link'
) => {
  try {
    await supabase.from('button_clicks').insert({
      button_name: buttonName,
      page_path: window.location.pathname,
      button_type: buttonType,
    });
  } catch (error) {
    console.error('Error tracking button click:', error);
  }
};
