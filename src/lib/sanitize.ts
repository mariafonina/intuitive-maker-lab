import DOMPurify from 'dompurify';

/**
 * Санитизация HTML для статей (контент, заголовки)
 * Разрешаем богатое форматирование, но блокируем XSS-векторы
 */
export const sanitizeArticleHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'div',
      'code', 'pre', 'mark', 'del', 's', 'sub', 'sup'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|data:image\/)/i,
  });
};

/**
 * Санитизация для embed-контента (iframe, видео)
 * Используется для контента от доверенных админов
 */
export const sanitizeEmbedHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['div', 'iframe', 'video', 'audio', 'source', 'embed'],
    ALLOWED_ATTR: [
      'src', 'width', 'height', 'style', 'class',
      'frameborder', 'allowfullscreen', 'webkitallowfullscreen',
      'mozallowfullscreen', 'allow', 'title', 'loading'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
  });
};
