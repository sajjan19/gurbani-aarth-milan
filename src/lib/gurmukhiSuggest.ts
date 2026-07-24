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

// "b"/"v" (ਬ/ਵ) commonly alternate in the same word depending on spelling
// convention (gobind/govind, etc.) -- phonetically adjacent, so treat a
// substitution between them like a matra swap rather than a full consonant
// swap.
const SOFT_CONSONANT_PAIRS = new Set(["ਬਵ", "ਵਬ"]);

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
  if (SOFT_CONSONANT_PAIRS.has(a + b)) return MATRA_COST;
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

type Ranked = { word: string; dist: number; score: number };

// Ranks every candidate in `words` against `guess` by (weighted) edit
// distance with a frequency nudge, restricting to words starting with the
// same character first -- our rule-based phonetic reading of the first
// consonant is usually reliable even when later syllables drift, and plain
// nearest-neighbor over all 30k+ words otherwise tends to snap short
// guesses to an unrelated word that merely happens to be a close
// character-count match. Falls back to the full vocabulary if that subset
// is empty. Returns candidates sorted best-first.
function rankCandidates(guess: string, vocabulary: VocabWord[]): Ranked[] {
  if (!guess) return [];
  const sameStart = vocabulary.filter((w) => w.word[0] === guess[0]);
  const pool = sameStart.length > 0 ? sameStart : vocabulary;

  const ranked = pool.map((candidate) => {
    const dist = editDistance(guess, candidate.word);
    return { word: candidate.word, dist, score: scoreOf(dist, candidate.count) };
  });
  ranked.sort((a, b) => a.score - b.score);
  return ranked;
}

type TokenMatch = { word: string; dist: number; runnerUp: string | null };

// Best (and, if reasonably close, second-best) real-word match for a single
// roman token. Rejects matches that are still too different to plausibly be
// what was meant (longer words tolerate more edits than short ones) and
// falls back to the raw phonetic guess in that case, with dist left at
// Infinity so callers can tell nothing in the vocabulary was close.
function matchToken(token: string, vocabulary: VocabWord[]): TokenMatch {
  if (!LATIN_RE.test(token)) return { word: token, dist: 0, runnerUp: null };

  const guess = transliteratePhonetic(token);
  const ranked = rankCandidates(guess, vocabulary);
  const maxAllowed = Math.max(1, guess.length * 0.4);
  const best = ranked[0];
  if (!best || best.dist > maxAllowed) return { word: guess, dist: Infinity, runnerUp: null };

  const runnerUp = ranked.find((r) => r.word !== best.word && r.dist <= maxAllowed) ?? null;
  return { word: best.word, dist: best.dist, runnerUp: runnerUp?.word ?? null };
}

export type SuggestResult = {
  // Best overall interpretation -- what gets searched and shown as
  // "Showing results for".
  primary: string;
  // True only if every word in `primary` is an exact vocabulary match (or
  // wasn't a roman word to begin with) -- drives "Did you mean" vs a plain
  // confident "Showing results for" in the UI.
  exact: boolean;
  // Other plausible whole-phrase readings worth searching alongside
  // `primary` (e.g. a close second-best word, or the alternate of
  // collapsing/splitting on spaces) -- deliberately kept short.
  alternates: string[];
};

// Guesses the Gurmukhi phrase a roman-typed query means, snapping each word
// to the closest real word actually used in the Guru Granth Sahib text
// (per the researcher spreadsheets) rather than trusting the phonetic guess
// verbatim -- so "satnaam" finds "ਸਤਿਨਾਮੁ" (how it's actually spelled)
// instead of the literal "ਸਤਨਾਮ" a naive letter-by-letter reading would
// produce. Returns null if the query has no roman letters.
export function suggestGurmukhi(rawQuery: string): SuggestResult | null {
  if (!LATIN_RE.test(rawQuery)) return null;

  const ikOnkar = matchIkOnkar(rawQuery);
  if (ikOnkar) return { primary: ikOnkar, exact: true, alternates: [] };

  const vocabulary = getVocabulary();
  const trimmed = rawQuery.trim();
  const tokens = trimmed.split(/\s+/);

  const perWord = tokens.map((token) => matchToken(token, vocabulary));
  const splitPrimary = perWord.map((m) => m.word).join(" ");
  const splitScore = perWord.reduce((sum, m) => sum + (Number.isFinite(m.dist) ? m.dist : m.word.length), 0);
  const splitExact = perWord.every((m) => m.dist === 0);

  // Multi-word input is often one compound word in the real text (e.g.
  // "wahe guru" / "sat naam" -> ਵਾਹਿਗੁਰੂ / ਸਤਿਨਾਮੁ are written with no
  // space), so also try reading the whole query as a single token and use
  // whichever reading is the stronger match.
  const collapsedToken = tokens.length > 1 ? tokens.join("") : null;
  const collapsedMatch = collapsedToken ? matchToken(collapsedToken, vocabulary) : null;

  let primary: string;
  let exact: boolean;
  const alternates = new Set<string>();

  // Two short roman words typed adjacently (e.g. "wahe guru", "sat naam")
  // are overwhelmingly meant as one compound devotional term rather than
  // two genuinely separate words -- prefer the collapsed reading whenever
  // it's an accepted match at all, even if the split reading happens to be
  // "exact" per word (each half being its own valid but unrelated word is
  // what makes the split misleadingly confident here).
  const looksLikeSplitCompound =
    tokens.length === 2 && tokens.every((t) => t.length <= 6) && collapsedMatch !== null && Number.isFinite(collapsedMatch.dist);

  if (collapsedMatch && (collapsedMatch.dist < splitScore || looksLikeSplitCompound)) {
    primary = collapsedMatch.word;
    exact = collapsedMatch.dist === 0;
    if (splitPrimary !== primary) alternates.add(splitPrimary);
  } else {
    primary = splitPrimary;
    exact = splitExact;
    if (collapsedMatch && collapsedMatch.word !== primary) alternates.add(collapsedMatch.word);
  }

  // A close runner-up on a single-word query is a real alternate reading
  // worth searching too (e.g. "satnam" ties between ਸੰਤਨ and ਸਤਿਨਾਮੁ).
  if (perWord.length === 1 && perWord[0].runnerUp && perWord[0].runnerUp !== primary) {
    alternates.add(perWord[0].runnerUp);
  }

  if (primary === trimmed && alternates.size === 0) return null;
  return { primary, exact, alternates: [...alternates].slice(0, 2) };
}

// Real vocabulary words that plausibly complete `prefix` -- the phonetic
// reading of a word the user is still in the middle of typing (e.g.
// "waheg" -> ਵਹੇਗ). An exact prefix match scores as a perfect (zero-cost)
// candidate, but isn't treated as automatically better than every fuzzy
// one: a word that only differs from the naive reading by a vowel length
// (e.g. "tu" reads as ਤੁ, one matra short of the far more common ਤੂ) is
// still a near-perfect match, and if it's used far more often it should
// win the same way frequency wins close calls everywhere else in this
// module. Only words at least as long as the prefix are eligible, since a
// shorter word can't be completed by more typing. This is also what
// naturally surfaces multiple spellings for an ambiguous prefix, e.g.
// "gobin" -> both ਗੋਬਿੰਦ and ਗੋਵਿੰਦ.
// A prefix is usually just 2-4 characters, where a single matra-level
// difference (like ਤੁ vs the far more common ਤੂ) is a much bigger fraction
// of what's typed than the same gap would be on a full word -- so
// frequency needs more say here than FREQUENCY_WEIGHT gives it elsewhere,
// or an extremely common short word never surfaces over a rarer one that
// merely happens to share its exact first few letters.
const PREFIX_FREQUENCY_WEIGHT = 0.5;

function prefixScoreOf(dist: number, count: number): number {
  return dist - PREFIX_FREQUENCY_WEIGHT * Math.log2(count + 1);
}

export function matchPrefix(prefix: string, limit: number): string[] {
  if (!prefix) return [];
  const vocabulary = getVocabulary();

  const candidates = vocabulary.filter((w) => w.word.length >= prefix.length);
  const sameStart = candidates.filter((w) => w.word[0] === prefix[0]);
  const pool = sameStart.length > 0 ? sameStart : candidates;
  const maxAllowed = Math.max(1, prefix.length * 0.4);

  const ranked = pool
    .map((w) => {
      const dist = w.word.startsWith(prefix) ? 0 : editDistance(prefix, w.word.slice(0, prefix.length));
      return { word: w.word, dist, score: prefixScoreOf(dist, w.count) };
    })
    .filter((r) => r.dist === 0 || r.dist <= maxAllowed)
    .sort((a, b) => a.score - b.score);

  const seen = new Set<string>();
  const results: string[] = [];
  for (const r of ranked) {
    if (seen.has(r.word)) continue;
    seen.add(r.word);
    results.push(r.word);
    if (results.length >= limit) break;
  }
  return results;
}

// Ranked whole-query candidates for autocomplete: every word but the last
// is corrected as a complete word (same as suggestGurmukhi), and the last
// (possibly still-being-typed) word is prefix-matched via matchPrefix --
// so multiple plausible completions of the last word (e.g. "gobin" ->
// ਗੋਬਿੰਦ / ਗੋਵਿੰਦ) become multiple whole-query anchors, each one then used
// to search for real verses starting with it.
export function suggestAutocompleteAnchors(rawQuery: string, limit: number): string[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return [];

  const ikOnkar = matchIkOnkar(trimmed);
  if (ikOnkar) return [ikOnkar];

  const vocabulary = getVocabulary();
  const tokens = trimmed.split(/\s+/);
  const head = tokens.slice(0, -1);
  const lastRaw = tokens[tokens.length - 1];

  const correctedHead = head.map((t) => (LATIN_RE.test(t) ? matchToken(t, vocabulary).word : t));

  let lastCandidates: string[];
  if (!LATIN_RE.test(lastRaw)) {
    lastCandidates = [lastRaw];
  } else {
    const phonetic = transliteratePhonetic(lastRaw);
    lastCandidates = matchPrefix(phonetic, limit);
    if (lastCandidates.length === 0) lastCandidates = [phonetic];
  }

  return lastCandidates.map((w) => [...correctedHead, w].join(" "));
}
