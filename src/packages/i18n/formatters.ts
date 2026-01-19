/**
 * i18n Formatters - Message formatting utilities
 */

/**
 * Format a message with parameters
 * @param template - Message template with {{param}} placeholders
 * @param params - Parameter values
 */
export function formatMessage(
  template: string,
  params: Record<string, string | number> = {}
): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  return result;
}

/**
 * Pluralize a word based on count
 * @param count - The count to check
 * @param singular - Singular form
 * @param plural - Plural form
 * @param zero - Optional zero form
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  zero?: string
): string {
  if (count === 0 && zero) {
    return zero;
  }
  return count === 1 ? singular : plural;
}

/**
 * Get plural form for Korean
 * Korean doesn't have grammatical plurals, but this can be used for counter words
 */
export function pluralizeKo(
  count: number,
  word: string,
  counter: string = '개'
): string {
  return `${count}${counter}의 ${word}`;
}
