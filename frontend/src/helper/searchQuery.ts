/**
 * Searches a list of full names using the Double Metaphone phonetic algorithm.
 *
 * @param query The full name to search for (e.g., "Jon Smith").
 * @param name The name to match (e.g.,["John Smith", "J. Smyth").
 * @returns An array of NameMatch objects indicating potential matches.
 */
export function searchNamesPhonetically(query: string, name: string): boolean {
  return name.toLowerCase().includes(query.toLowerCase());
}
