import stringSimilarity from "string-similarity";

export function isFuzzyNameMatch(
  searchQuery: string,
  targetName: string,
  minTokenMatchScore: number = 0.7,
  minOverallCoverage: number = 0.5
): boolean {
  if (!searchQuery) return true; // If no query, consider it a match to show all
  if (targetName.toLowerCase().includes(searchQuery.toLowerCase())) return true;

  const queryTokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const targetTokens = targetName.toLowerCase().split(/\s+/).filter(Boolean);

  if (queryTokens.length === 0) return true;

  // Track which target tokens have been successfully matched
  const matchedTargetIndices = new Set<number>();
  let totalMatchScore = 0;

  for (const queryToken of queryTokens) {
    let bestMatchScore = 0;
    let bestMatchIndex = -1;

    for (let i = 0; i < targetTokens.length; i++) {
      const targetToken = targetTokens[i];
      // Use Jaro-Winkler to compare strings
      const score = stringSimilarity.compareTwoStrings(queryToken, targetToken);

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatchIndex = i;
      }
    }

    // If the best match is above the minimum score, consider it a successful match
    if (bestMatchScore >= minTokenMatchScore) {
      totalMatchScore += bestMatchScore;
      matchedTargetIndices.add(bestMatchIndex);
    }
  }

  // CRITICAL: Check for enough matches relative to the target's length.
  // This prevents matching "Jo" against "Joshua Cinco" by checking if at least
  // one target token ("Joshua" OR "Cinco") was matched.
  const coverage = matchedTargetIndices.size / targetTokens.length;

  return coverage >= minOverallCoverage;
}
