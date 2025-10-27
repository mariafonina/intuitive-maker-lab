/**
 * Форматирует дату в локализованный формат
 */
export const formatDate = (date: string | Date, locale: string = "ru-RU"): string => {
  return new Date(date).toLocaleDateString(locale);
};

/**
 * Форматирует дату и время
 */
export const formatDateTime = (date: string | Date, locale: string = "ru-RU"): string => {
  return new Date(date).toLocaleString(locale);
};

/**
 * Очищает HTML теги из строки
 */
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Создает краткое описание из HTML контента
 */
export const createExcerpt = (html: string, maxLength: number = 150): string => {
  const text = stripHtmlTags(html);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Подсчитывает примерное время чтения текста
 */
export const calculateReadingTime = (content: string, wordsPerMinute: number = 230): number => {
  const text = stripHtmlTags(content);
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Форматирует множественное число для русского языка
 */
export const pluralize = (count: number, singular: string, few: string, many: string): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  
  if (mod10 === 1 && mod100 !== 11) {
    return singular;
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few;
  } else {
    return many;
  }
};
