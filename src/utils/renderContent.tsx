import { OfferShortcode } from "@/components/OfferShortcode";
import { SafeHTMLRenderer } from "@/components/SafeHTMLRenderer";

// Функция для обработки Raw HTML блоков
const processRawHTML = (content: string): { 
  content: string; 
  htmlBlocks: Array<{ id: string; html: string }> 
} => {
  const div = document.createElement('div');
  div.innerHTML = content;
  const htmlBlocks: Array<{ id: string; html: string }> = [];
  
  // Находим все div с data-raw-html атрибутом
  const rawHTMLBlocks = div.querySelectorAll('div[data-raw-html]');
  
  rawHTMLBlocks.forEach((block, index) => {
    const htmlContent = block.getAttribute('data-raw-html');
    if (htmlContent) {
      // Декодируем HTML entities
      const textarea = document.createElement('textarea');
      textarea.innerHTML = htmlContent;
      const decodedHTML = textarea.value;
      
      // Создаем уникальный ID для этого блока
      const blockId = `raw-html-${index}`;
      htmlBlocks.push({ id: blockId, html: decodedHTML });
      
      // Заменяем блок на плейсхолдер
      const placeholder = document.createElement('div');
      placeholder.setAttribute('data-html-placeholder', blockId);
      block.replaceWith(placeholder);
    }
  });
  
  return { content: div.innerHTML, htmlBlocks };
};

// Функция для парсинга и рендера контента со шорткодами
export const renderContentWithShortcodes = (content: string) => {
  // Сначала обрабатываем Raw HTML блоки
  const { content: processedContent, htmlBlocks } = processRawHTML(content);
  
  // Паттерн для поиска [offer id="xxx"] или [offer id="xxx" compact]
  const offerPattern = /\[offer\s+id="([^"]+)"(\s+compact)?\]/g;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = offerPattern.exec(processedContent)) !== null) {
    // Добавляем текст до шорткода
    if (match.index > lastIndex) {
      const htmlContent = processedContent.slice(lastIndex, match.index);
      parts.push(...renderHTMLContent(htmlContent, htmlBlocks, key++));
    }

    // Добавляем компонент предложения
    const offerId = match[1];
    const isCompact = !!match[2];
    
    parts.push(
      <div key={`offer-${key++}`} className="my-8">
        <OfferShortcode offerId={offerId} compact={isCompact} />
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Добавляем оставшийся текст
  if (lastIndex < processedContent.length) {
    const htmlContent = processedContent.slice(lastIndex);
    parts.push(...renderHTMLContent(htmlContent, htmlBlocks, key++));
  }

  // Если не было шорткодов, возвращаем весь контент как HTML
  if (parts.length === 0) {
    return <>{renderHTMLContent(processedContent, htmlBlocks, 0)}</>;
  }

  return <>{parts}</>;
};

// Вспомогательная функция для рендера HTML контента с плейсхолдерами
const renderHTMLContent = (
  htmlContent: string, 
  htmlBlocks: Array<{ id: string; html: string }>,
  baseKey: number
): JSX.Element[] => {
  const parts: JSX.Element[] = [];
  const div = document.createElement('div');
  div.innerHTML = htmlContent;
  
  // Находим все плейсхолдеры
  const placeholders = div.querySelectorAll('[data-html-placeholder]');
  
  if (placeholders.length === 0) {
    // Нет плейсхолдеров, возвращаем обычный HTML
    parts.push(
      <div 
        key={`text-${baseKey}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="prose prose-slate max-w-none dark:prose-invert"
      />
    );
  } else {
    // Заменяем плейсхолдеры на SafeHTMLRenderer компоненты
    let currentHTML = '';
    let lastNode: Node | null = null;
    
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ALL);
    let node: Node | null;
    
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const placeholderId = element.getAttribute('data-html-placeholder');
        
        if (placeholderId) {
          // Сохраняем текущий HTML
          if (currentHTML.trim()) {
            parts.push(
              <div 
                key={`text-${baseKey}-${parts.length}`}
                dangerouslySetInnerHTML={{ __html: currentHTML }}
                className="prose prose-slate max-w-none dark:prose-invert"
              />
            );
            currentHTML = '';
          }
          
          // Находим соответствующий HTML блок
          const htmlBlock = htmlBlocks.find(b => b.id === placeholderId);
          if (htmlBlock) {
            parts.push(
              <SafeHTMLRenderer 
                key={`html-${baseKey}-${parts.length}`}
                html={htmlBlock.html}
                className="my-8"
              />
            );
          }
          
          lastNode = node;
          continue;
        }
      }
      
      // Добавляем обычный контент
      if (node !== lastNode) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          currentHTML += (node as HTMLElement).outerHTML;
        } else if (node.nodeType === Node.TEXT_NODE) {
          currentHTML += node.textContent || '';
        }
      }
    }
    
    // Добавляем оставшийся HTML
    if (currentHTML.trim()) {
      parts.push(
        <div 
          key={`text-${baseKey}-${parts.length}`}
          dangerouslySetInnerHTML={{ __html: currentHTML }}
          className="prose prose-slate max-w-none dark:prose-invert"
        />
      );
    }
  }
  
  return parts;
};