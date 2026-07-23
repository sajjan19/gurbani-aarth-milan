import { transliteratePhonetic } from "./transliterate";
import { getVocabulary, type VocabWord } from "./vocabulary";

const LATIN_RE = /[A-Za-z]/;

// ੴ (Ik Onkar) is a single ligature, not a word spelled out of ordinary
// consonants and matras -- it can't be phonetically transliterated or found
// via the word vocabulary (which strips it out as punctuation), so common
// roman spellings are special-cased directly to the symbol.
const IK_ONKAR_ALIASES = new Set([
  "ikonkar", "ekonkar", "ikongkar", "ekongkar", "ikonkaar", "ekonkaar", "ikaunkar", "ekaunkar",
]);

function matchIkOnkar(rawQuery: string): string | null {
  const normalized = rawQuery.trim().toLowerCase().replace(/\s+/g, "");
  return IK_ONKAR_ALIASES.has(normalized) ? "ੴ" : null;
}

// Vowel signs (matras) and other combining marks: our rule-based phonetic
// reading gets consonants right far more reliably than it gets these right
// (dropped inherent vowels, wrong long/short matra, missing nasalization),
// so a mismatch here should count for much less than a mismatched consonant
// when judging how close two spellings are.
const MATRA_CHARS = new Set([
  "ਾ", "ਿ", "ੀ", "ੁ", "ੂ", "ੇ", "ੈ", "ੋ", "ੌ", "ਂ", "ਃ", "ੰ", "ੱ", "਼", "੍",
]);
const MATRA_COST = 0.5;
const CONSONANT_COST = 1;

// A syllable-final "n"/"m" sound is often written as a full consonant by
// our phonetic reading (roman "n" -> ਨ) when the actual text uses
// nasalization marks instead (ਂ/ੰ) -- e.g. "mantar" reads as ਮਨਤਰ but is
// spelled ਮੰਤਰ. These are phonetically the same sound, so substituting one
// for the other should cost like a matra swap, not a full consonant swap.
const NASAL_CONSONANTS = new Set(["ਨ", "ਣ", "ਮ"]);
const NASAL_MARKS = new Set(["ਂ", "ੰ"]);

function editCost(ch: string): number {
  return MATRA_CHARS.has(ch) ? MATRA_COST : CONSONANT_COST;
}

function isNasalSwap(a: string, b: string): boolean {
  return (NASAL_CONSONANTS.has(a) && NASAL_MARKS.has(b)) || (NASAL_CONSONANTS.has(b) && NASAL_MARKS.has(a));
}

function subCost(a: string, b: string): number {
  if (a === b) return 0;
  if (MATRA_CHARS.has(a) && MATRA_CHARS.has(b)) return MATRA_COST;
  if (isNasalSwap(a, b)) return MATRA_COST;
  return CONSONANT_COST;
}

// Weighted Levenshtein distance (single-row DP): insert/delete/substitute
// cost less when the character involved is a matra rather than a
// consonant, so two spellings that differ mainly in vowel signs come out
// closer than two that differ in consonants -- see MATRA_CHARS above.
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return [...b].reduce((sum, ch) => sum + editCost(ch), 0);
  if (n === 0) return [...a].reduce((sum, ch) => sum + editCost(ch), 0);

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  prev[0] = 0;
  for (let j = 1; j <= n; j++) prev[j] = prev[j - 1] + editCost(b[j - 1]);

  for (let i = 1; i <= m; i++) {
    curr[0] = prev[0] + editCost(a[i - 1]);
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        curr[j - 1] + editCost(b[j - 1]),
        prev[j] + editCost(a[i - 1]),
        prev[j - 1] + subCost(a[i - 1], b[j - 1])
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// How much a word's frequency in the text can outweigh a small edit-distance
// disadvantage -- e.g. "baba" (guess ਬਬ) edit-distance-wise sits fractionally
// closer to the near-nonexistent "ਬੇਬ" (used once) than to "ਬਾਬਾ" (used 56
// times), but "ਬਾਬਾ" is overwhelmingly the more likely intent. Weighted by
// log so a word used 100x more often can overcome roughly one matra-level
// edit, but a rare near-exact match still beats a common, more-different
// word -- frequency nudges close calls, it doesn't override real distance.
const FREQUENCY_WEIGHT = 0.15;

function scoreOf(dist: number, count: number): number {
  return dist - FREQUENCY_WEIGHT * Math.log2(count + 1);
}

// Scans `words` for the entry closest to `guess`, ranking candidates by
// (weighted) edit distance with a frequency nudge (see FREQUENCY_WEIGHT).
function nearest(guess: string, words: VocabWord[]): { word: string; dist: number } | null {
  let best: { word: string; dist: number } | null = null;
  let bestScore = Infinity;
  for (const candidate of words) {
    const dist = editDistance(guess, candidate.word);
    const score = scoreOf(dist, candidate.count);
    if (score < bestScore) {
      bestScore = score;
      best = { word: candidate.word, dist };
    }
  }
  return best;
}

// Finds the vocabulary word closest to `guess`. Rejects the match if it's
// still too different to plausibly be what was meant (longer words
// tolerate more edits than short ones). Our rule-based phonetic reading of
// the first consonant is usually reliable even when later syllables drift,
// so we first restrict the search to words starting with the same
// character -- plain nearest-neighbor over all 30k+ words otherwise tends
// to snap short guesses to an unrelated word that merely happens to be a
// close character-count match. Only falls back to the full vocabulary if
// that comes up empty.
function closestWord(guess: string, vocabulary: VocabWord[]): string | null {
  if (!guess) return null;

  const sameStart = vocabulary.filter((w) => w.word[0] === guess[0]);
  const primary = sameStart.length > 0 ? nearest(guess, sameStart) : null;
  const match = primary ?? nearest(guess, vocabulary);
  if (!match) return null;

  const maxAllowed = Math.max(1, guess.length * 0.4);
  return match.dist <= maxAllowed ? match.word : null;
}

// Guesses the Gurmukhi phrase a roman-typed query means, word by word,
// snapping each word to the closest real word actually used in the Guru
// Granth Sahib text (per the researcher spreadsheets) rather than trusting
// the phonetic guess verbatim -- so "satnaam" finds "ਸਤਿਨਾਮੁ" (how it's
// actually spelled in the text) instead of the literal "ਸਤਨਾਮ" a naive
// letter-by-letter reading would produce. Returns null if the query has no
// roman letters, or if nothing changed.
export function suggestGurmukhi(rawQuery: string): string | null {
  if (!LATIN_RE.test(rawQuery)) return null;

  const ikOnkar = matchIkOnkar(rawQuery);
  if (ikOnkar) return ikOnkar;

  const vocabulary = getVocabulary();
  const tokens = rawQuery.trim().split(/\s+/);
  const corrected = tokens.map((token) => {
    if (!LATIN_RE.test(token)) return token;
    const guess = transliteratePhonetic(token);
    return closestWord(guess, vocabulary) ?? guess;
  });

  const result = corrected.join(" ");
  return result !== rawQuery.trim() ? result : null;
}
