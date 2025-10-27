import { OfferShortcode } from "@/components/OfferShortcode";

// Функция для обработки Raw HTML блоков
const processRawHTML = (content: string): string => {
  const div = document.createElement('div');
  div.innerHTML = content;
  
  // Находим все div с data-raw-html атрибутом
  const rawHTMLBlocks = div.querySelectorAll('div[data-raw-html]');
  
  rawHTMLBlocks.forEach((block) => {
    const htmlContent = block.getAttribute('data-raw-html');
    if (htmlContent) {
      // Декодируем HTML entities
      const textarea = document.createElement('textarea');
      textarea.innerHTML = htmlContent;
      const decodedHTML = textarea.value;
      
      // Создаем контейнер для рендеринга
      const container = document.createElement('div');
      container.className = 'my-8 w-full';
      container.innerHTML = decodedHTML;
      block.replaceWith(container);
    }
  });
  
  return div.innerHTML;
};

// Функция для парсинга и рендера контента со шорткодами
export const renderContentWithShortcodes = (content: string) => {
  // Сначала обрабатываем Raw HTML блоки
  const processedContent = processRawHTML(content);
  
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
      parts.push(
        <div 
          key={`text-${key++}`}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="prose prose-slate max-w-none dark:prose-invert"
        />
      );
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
    parts.push(
      <div 
        key={`text-${key++}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="prose prose-slate max-w-none dark:prose-invert"
      />
    );
  }

  // Если не было шорткодов, возвращаем весь контент как HTML
  if (parts.length === 0) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: processedContent }}
        className="prose prose-slate max-w-none dark:prose-invert"
      />
    );
  }

  return <>{parts}</>;
};