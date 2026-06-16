/**
 * Returns true when `name` contains `query` as a case-insensitive substring.
 *
 * NOTE: Despite the name, this performs a plain substring match, not a phonetic
 * (Double Metaphone) comparison. Kept as-is for behavioural compatibility.
 *
 * @param query The text to search for (e.g., "jon").
 * @param name The name to match against (e.g., "John Smith").
 * @returns Whether `name` contains `query`, ignoring case.
 */
export function searchNamesPhonetically(query: string, name: string): boolean {
  return name.toLowerCase().includes(query.toLowerCase());
}
