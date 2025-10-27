import { useMemo } from 'react';

interface SafeHTMLRendererProps {
  html: string;
  className?: string;
}

/**
 * Компонент для безопасного рендеринга HTML кода
 * Используется для embed-контента (iframe, видео и т.д.)
 * 
 * ВАЖНО: Используется только в контексте админской панели,
 * где доверенные пользователи вставляют контент
 */
export const SafeHTMLRenderer = ({ html, className = '' }: SafeHTMLRendererProps) => {
  // Базовая санитизация для защиты от явных XSS
  const sanitizedHTML = useMemo(() => {
    // Разрешаем только безопасные теги для embed-контента
    const allowedTags = ['div', 'iframe', 'video', 'audio', 'source', 'embed', 'object', 'param'];
    const allowedAttributes = [
      'src', 'width', 'height', 'style', 'class', 
      'frameborder', 'allowfullscreen', 'webkitallowfullscreen', 
      'mozallowfullscreen', 'allow', 'title', 'loading'
    ];
    
    // Создаем временный DOM элемент для парсинга
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Проверяем все элементы
    const elements = temp.querySelectorAll('*');
    elements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      
      // Удаляем недопустимые теги
      if (!allowedTags.includes(tagName)) {
        el.remove();
        return;
      }
      
      // Удаляем недопустимые атрибуты
      const attrs = Array.from(el.attributes);
      attrs.forEach((attr) => {
        if (!allowedAttributes.includes(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name);
        }
      });
      
      // Проверяем src на подозрительные протоколы
      const src = el.getAttribute('src');
      if (src && !src.match(/^(https?:\/\/|\/\/)/i)) {
        el.removeAttribute('src');
      }

      // Добавляем eager loading для iframe
      if (tagName === 'iframe') {
        el.setAttribute('loading', 'eager');
        // Устанавливаем минимальную высоту для предотвращения layout shift
        if (!el.getAttribute('height')) {
          el.setAttribute('style', (el.getAttribute('style') || '') + 'min-height: 400px;');
        }
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
