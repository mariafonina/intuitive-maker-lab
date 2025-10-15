/**
 * Adds non-breaking spaces to prevent orphans (hanging prepositions, conjunctions, and short words)
 * in Russian typography
 */
export const preventOrphans = (text: string): string => {
  // List of short words that shouldn't be left at the end of a line (Russian prepositions and conjunctions)
  const shortWords = [
    'в', 'на', 'с', 'к', 'у', 'о', 'по', 'до', 'за', 'из', 'от', 'для', 'без', 'под', 'при', 'через',
    'и', 'а', 'но', 'или', 'что', 'как', 'чтобы', 'если', 'то', 'же', 'ли', 'бы',
    'не', 'ни', 'уже', 'еще', 'же', 'ли', 'бы', 'это', 'все', 'вся', 'весь', 'мой', 'моя', 'мое', 'мои',
    'твой', 'твоя', 'твое', 'твои', 'его', 'ее', 'их', 'наш', 'наша', 'наше', 'наши', 'ваш', 'ваша', 'ваше', 'ваши'
  ];

  let result = text;

  // Replace space after short words with non-breaking space
  shortWords.forEach(word => {
    // Match word boundary, the short word, and a space
    const regex = new RegExp(`\\b${word}\\s`, 'gi');
    result = result.replace(regex, `${word}\u00A0`);
  });

  // Replace space after numbers with non-breaking space
  result = result.replace(/(\d+)\s/g, '$1\u00A0');

  // Prevent orphans before punctuation
  result = result.replace(/\s([—–-])/g, '\u00A0$1');

  return result;
};
