/**
 * Типографская утилита для правильной расстановки неразрывных пробелов
 * Предлоги и союзы не должны оставаться в конце строки
 */

// Список русских предлогов и союзов (1-3 буквы)
const PREPOSITIONS = [
  // Предлоги (только маленькие буквы)
  'в', 'на', 'за', 'к', 'с', 'о', 'об', 'от', 'до', 'из', 'у', 'по', 'во',
  'со', 'ко', 'про', 'для', 'без', 'под', 'над', 'при', 'через',
  // Союзы
  'и', 'а', 'но', 'да', 'или', 'ни', 'то', 'не',
  // Частицы
  'ли', 'же', 'бы', 'б', 'ж',
];

/**
 * Извлекает текст из HTML, сохраняя структуру для последующей обработки
 */
const extractTextNodes = (html: string): Array<{ type: 'text' | 'tag', content: string }> => {
  const result: Array<{ type: 'text' | 'tag', content: string }> = [];
  const tagPattern = /<[^>]+>/g;
  let lastIndex = 0;
  let match;
  
  while ((match = tagPattern.exec(html)) !== null) {
    // Текст до тега
    if (match.index > lastIndex) {
      const textContent = html.slice(lastIndex, match.index);
      if (textContent) {
        result.push({ type: 'text', content: textContent });
      }
    }
    
    // Сам тег
    result.push({ type: 'tag', content: match[0] });
    lastIndex = match.index + match[0].length;
  }
  
  // Оставшийся текст
  if (lastIndex < html.length) {
    const textContent = html.slice(lastIndex);
    if (textContent) {
      result.push({ type: 'text', content: textContent });
    }
  }
  
  return result;
};

/**
 * Применяет типографику только к текстовому контенту
 */
const applyTypographyToText = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  let result = text;
  
  // Заменяем пробелы после предлогов на неразрывные
  // Используем word boundary для корректного определения границ слов
  PREPOSITIONS.forEach(prep => {
    // Предлог в начале строки или после пробела/знака препинания
    // Важно: \b не работает с кириллицей, поэтому используем альтернативный подход
    const pattern = new RegExp(`(^|\\s|[—–-])${prep}\\s+(?=[а-яёА-ЯЁ])`, 'g');
    result = result.replace(pattern, `$1${prep}\u00A0`);
  });
  
  // Числа с единицами измерения
  result = result.replace(/(\d+)\s+(руб|₽|USD|EUR|%|шт|кг|г|м|см|км|л|мл)/gi, '$1\u00A0$2');
  
  // Инициалы
  result = result.replace(/([А-ЯЁ]\.)\s+([А-ЯЁ]\.)/g, '$1\u00A0$2');
  result = result.replace(/([А-ЯЁ]\.[А-ЯЁ]\.)\s+([А-ЯЁ][а-яё]+)/g, '$1\u00A0$2');
  
  // Короткие слова перед тире
  result = result.replace(/\s([а-яёА-ЯЁ]{1,2})\s+([—–])/g, ' $1\u00A0$2');
  
  // Год и другие числа с "г."
  result = result.replace(/(\d+)\s+г\./g, '$1\u00A0г.');
  
  // Кавычки (ёлочки)
  result = result.replace(/\s«/g, '\u00A0«');
  result = result.replace(/»\s/g, '»\u00A0');
  
  return result;
};

/**
 * Добавляет неразрывные пробелы после предлогов и союзов
 * Работает с HTML, не ломая теги
 * Также добавляет loading="eager" для изображений для быстрой загрузки
 */
export const applyTypography = (html: string): string => {
  if (!html || typeof html !== 'string') return html;
  
  // Извлекаем текст и теги отдельно
  const nodes = extractTextNodes(html);
  
  // Применяем типографику только к текстовым узлам
  const processed = nodes.map(node => {
    if (node.type === 'text') {
      return applyTypographyToText(node.content);
    }
    // Добавляем loading="eager" к img тегам для предзагрузки
    if (node.type === 'tag' && node.content.startsWith('<img')) {
      // Проверяем, есть ли уже атрибут loading
      if (!node.content.includes('loading=')) {
        // Добавляем loading="eager" перед закрывающим >
        return node.content.replace(/>$/, ' loading="eager">');
      }
    }
    return node.content;
  });
  
  return processed.join('');
};

/**
 * Применяет типографику ко всем текстовым элементам на странице
 * Используется для статического контента
 */
export const applyTypographyToElement = (element: HTMLElement) => {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Пропускаем пустые узлы и узлы внутри code, pre, script
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        
        const parent = node.parentElement;
        if (parent && ['CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const textNodes: Text[] = [];
  let node: Node | null;
  
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }
  
  textNodes.forEach(textNode => {
    const originalText = textNode.textContent || '';
    const improvedText = applyTypographyToText(originalText);
    
    if (originalText !== improvedText) {
      textNode.textContent = improvedText;
    }
  });
};

/**
 * React хук для применения типографики к элементу
 */
export const useTypography = (ref: React.RefObject<HTMLElement>) => {
  if (ref.current) {
    applyTypographyToElement(ref.current);
  }
};
