import { OfferShortcode } from "@/components/OfferShortcode";
import { SafeHTMLRenderer } from "@/components/SafeHTMLRenderer";
import { applyTypography } from "@/lib/typography";

// Функция для обработки Raw HTML блоков
const processRawHTML = (content: string): { 
  content: string; 
  htmlBlocks: Array<{ id: string; html: string; isShortcode: boolean }> 
} => {
  const div = document.createElement('div');
  div.innerHTML = content;
  const htmlBlocks: Array<{ id: string; html: string; isShortcode: boolean }> = [];
  
  // Находим все div с data-raw-html атрибутом
  const rawHTMLBlocks = div.querySelectorAll('div[data-raw-html]');
  
  rawHTMLBlocks.forEach((block, index) => {
    const htmlContent = block.getAttribute('data-raw-html');
    if (htmlContent) {
      // Декодируем HTML entities
      const textarea = document.createElement('textarea');
      textarea.innerHTML = htmlContent;
      const decodedHTML = textarea.value;
      
      // Проверяем, является ли это шорткодом offer
      const isOfferShortcode = /^\[offer\s+id="[^"]+"\s*(compact)?\]$/.test(decodedHTML.trim());
      
      // Создаем уникальный ID для этого блока
      const blockId = `raw-html-${index}`;
      htmlBlocks.push({ 
        id: blockId, 
        html: decodedHTML,
        isShortcode: isOfferShortcode
      });
      
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
  // Обрабатываем Raw HTML блоки
  const { content: processedContent, htmlBlocks } = processRawHTML(content);
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let key = 0;

  // Паттерн для поиска [offer id="xxx"] или [offer id="xxx" compact]
  const offerPattern = /\[offer\s+id="([^"]+)"(\s+compact)?\]/g;
  let match;
  
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
  htmlBlocks: Array<{ id: string; html: string; isShortcode: boolean }>,
  baseKey: number
): JSX.Element[] => {
  const parts: JSX.Element[] = [];
  
  // Если нет HTML блоков, просто возвращаем контент
  if (htmlBlocks.length === 0) {
    parts.push(
      <div 
        key={`text-${baseKey}`}
        dangerouslySetInnerHTML={{ __html: applyTypography(htmlContent) }}
        className="prose prose-slate max-w-none dark:prose-invert"
      />
    );
    return parts;
  }
  
  // Разбиваем контент по плейсхолдерам
  let remainingContent = htmlContent;
  let partIndex = 0;
  
  htmlBlocks.forEach((block) => {
    const placeholderPattern = `<div data-html-placeholder="${block.id}"></div>`;
    const placeholderIndex = remainingContent.indexOf(placeholderPattern);
    
    if (placeholderIndex !== -1) {
      // Добавляем контент до плейсхолдера
      const beforeContent = remainingContent.substring(0, placeholderIndex);
      if (beforeContent.trim()) {
        parts.push(
          <div 
            key={`text-${baseKey}-${partIndex++}`}
            dangerouslySetInnerHTML={{ __html: applyTypography(beforeContent) }}
            className="prose prose-slate max-w-none dark:prose-invert"
          />
        );
      }
      
      // Проверяем, является ли блок шорткодом offer
      if (block.isShortcode) {
        // Парсим шорткод
        const offerMatch = block.html.match(/\[offer\s+id="([^"]+)"(\s+compact)?\]/);
        if (offerMatch) {
          const offerId = offerMatch[1];
          const isCompact = !!offerMatch[2];
          parts.push(
            <div key={`offer-${baseKey}-${partIndex++}`} className="my-8">
              <OfferShortcode offerId={offerId} compact={isCompact} />
            </div>
          );
        }
      } else {
        // Добавляем HTML блок
        parts.push(
          <SafeHTMLRenderer 
            key={`html-${baseKey}-${partIndex++}`}
            html={block.html}
            className="my-8"
          />
        );
      }
      
      // Обновляем оставшийся контент
      remainingContent = remainingContent.substring(placeholderIndex + placeholderPattern.length);
    }
  });
  
  // Добавляем оставшийся контент
  if (remainingContent.trim()) {
    parts.push(
      <div 
        key={`text-${baseKey}-${partIndex}`}
        dangerouslySetInnerHTML={{ __html: applyTypography(remainingContent) }}
        className="prose prose-slate max-w-none dark:prose-invert"
      />
    );
  }
  
  return parts;
};