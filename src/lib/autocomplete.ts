import { suggestAutocompleteAnchors } from "./gurmukhiSuggest";
import { searchPhrasesByPrefix } from "./search";

const MAX_SUGGESTIONS = 8;
const ANCHOR_LIMIT = 3;
const PHRASES_PER_ANCHOR = 4;

// Google-style live suggestions for the search box, sourced only from the
// phrase column (never researchers/translations/metadata -- see
// searchPhrasesByPrefix). Roman input is first normalized to one or more
// plausible Gurmukhi readings (suggestAutocompleteAnchors), since a partial
// or slightly misspelled word can have more than one reasonable
// completion; each reading is then used to look up real verses that start
// with it. A reading with no real verse starting with it (common for a
// bare word that only ever appears mid-verse) still contributes itself as
// a suggestion, so the user sees their typing was understood even without
// a longer completion.
export function getAutocompleteSuggestions(rawQuery: string): string[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return [];

  const anchors = suggestAutocompleteAnchors(trimmed, ANCHOR_LIMIT);
  const suggestions: string[] = [];
  const seen = new Set<string>();

  for (const anchor of anchors) {
    const phraseMatches = searchPhrasesByPrefix(anchor, PHRASES_PER_ANCHOR);
    let addedForThisAnchor = 0;
    for (const { phrase } of phraseMatches) {
      if (seen.has(phrase)) continue;
      seen.add(phrase);
      suggestions.push(phrase);
      addedForThisAnchor++;
      if (suggestions.length >= MAX_SUGGESTIONS) return suggestions;
    }
    if (addedForThisAnchor === 0 && !seen.has(anchor)) {
      seen.add(anchor);
      suggestions.push(anchor);
      if (suggestions.length >= MAX_SUGGESTIONS) return suggestions;
    }
  }

  return suggestions;
}
