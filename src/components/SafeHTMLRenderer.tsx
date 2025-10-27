import { useMemo } from 'react';
import { sanitizeEmbedHtml } from '@/lib/sanitize';

interface SafeHTMLRendererProps {
  html: string;
  className?: string;
}

/**
 * Компонент для безопасного рендеринга HTML кода
 * Используется для embed-контента (iframe, видео и т.д.)
 * 
 * ВАЖНО: Использует DOMPurify для надежной санитизации
 */
export const SafeHTMLRenderer = ({ html, className = '' }: SafeHTMLRendererProps) => {
  const sanitizedHTML = useMemo(() => {
    const cleaned = sanitizeEmbedHtml(html);
    
    // Добавляем loading="eager" для iframe после санитизации
    const temp = document.createElement('div');
    temp.innerHTML = cleaned;
    
    const iframes = temp.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      iframe.setAttribute('loading', 'eager');
      if (!iframe.getAttribute('height')) {
        iframe.setAttribute('style', (iframe.getAttribute('style') || '') + 'min-height: 400px;');
      }
    });
    
    return temp.innerHTML;
  }, [html]);
  
  return (
    <div 
      className={`embedded-content-container ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};
