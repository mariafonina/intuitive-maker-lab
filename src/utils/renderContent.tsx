import { OfferShortcode } from "@/components/OfferShortcode";

// Функция для парсинга и рендера контента со шорткодами
export const renderContentWithShortcodes = (content: string) => {
  // Паттерн для поиска [offer id="xxx"] или [offer id="xxx" compact]
  const offerPattern = /\[offer\s+id="([^"]+)"(\s+compact)?\]/g;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = offerPattern.exec(content)) !== null) {
    // Добавляем текст до шорткода
    if (match.index > lastIndex) {
      const htmlContent = content.slice(lastIndex, match.index);
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
  if (lastIndex < content.length) {
    const htmlContent = content.slice(lastIndex);
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
        dangerouslySetInnerHTML={{ __html: content }}
        className="prose prose-slate max-w-none dark:prose-invert"
      />
    );
  }

  return <>{parts}</>;
};