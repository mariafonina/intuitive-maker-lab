/**
 * Типографская утилита для правильной расстановки неразрывных пробелов
 * Предлоги и союзы не должны оставаться в конце строки
 */

// Список русских предлогов и союзов (1-3 буквы)
const PREPOSITIONS = [
  // Предлоги
  'в', 'на', 'за', 'к', 'с', 'о', 'об', 'от', 'до', 'из', 'у', 'по', 'во',
  'со', 'ко', 'про', 'для', 'без', 'под', 'над', 'при', 'через',
  // Союзы
  'и', 'а', 'но', 'да', 'или', 'ни', 'то', 'не',
  // Частицы
  'ли', 'же', 'бы', 'б', 'ж',
];

/**
 * Добавляет неразрывные пробелы после предлогов и союзов
 * Также обрабатывает короткие слова (1-2 буквы) в начале предложения
 */
export const applyTypography = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  let result = text;
  
  // Заменяем пробелы после предлогов на неразрывные
  PREPOSITIONS.forEach(prep => {
    // В начале строки или после пробела/знака препинания
    const pattern = new RegExp(`(^|\\s|[—–-])${prep}\\s+`, 'gi');
    result = result.replace(pattern, `$1${prep}\u00A0`);
  });
  
  // Короткие слова (1-2 буквы) в начале предложения тоже склеиваем
  result = result.replace(/([.!?]\s+)([а-яёА-ЯЁ]{1,2})\s+/g, '$1$2\u00A0');
  
  // Числа с единицами измерения
  result = result.replace(/(\d+)\s+(руб|₽|USD|EUR|%|шт|кг|г|м|см|км|л|мл)/gi, '$1\u00A0$2');
  
  // Инициалы
  result = result.replace(/([А-ЯЁ]\.)\s+([А-ЯЁ]\.)/g, '$1\u00A0$2');
  result = result.replace(/([А-ЯЁ]\.[А-ЯЁ]\.)\s+([А-ЯЁ][а-яё]+)/g, '$1\u00A0$2');
  
  // Короткие слова перед тире
  result = result.replace(/([а-яёА-ЯЁ]{1,2})\s+([—–-])/g, '$1\u00A0$2');
  
  // Год и другие числа с "г."
  result = result.replace(/(\d+)\s+г\./g, '$1\u00A0г.');
  
  return result;
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
        if (parent && ['CODE', 'PRE', 'SCRIPT', 'STYLE'].includes(parent.tagName)) {
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
    const improvedText = applyTypography(originalText);
    
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
