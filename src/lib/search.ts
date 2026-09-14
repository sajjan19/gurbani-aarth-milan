import { getDb } from "./db";

export type Researcher = {
  id: number;
  key: string;
  displayName: string;
  language: "pa" | "en";
  sortOrder: number;
};

export type VerseTranslation = {
  researcherId: number;
  displayName: string;
  language: "pa" | "en";
  text: string;
};

export type VerseResult = {
  id: number;
  page: number;
  verse: number;
  line: number | null;
  phrase: string;
  translations: VerseTranslation[];
};

const MAX_RESULTS = 50;

export function getResearchers(): Researcher[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, key, display_name as displayName, language, sort_order as sortOrder FROM researchers ORDER BY sort_order"
    )
    .all() as Researcher[];
  return rows;
}

function attachTranslations(
  verses: Omit<VerseResult, "translations">[],
  researcherIds: number[] | null
): VerseResult[] {
  if (verses.length === 0) return [];

  const db = getDb();
  const verseIds = verses.map((v) => v.id);
  const idPlaceholders = verseIds.map(() => "?").join(",");

  let sql = `
    SELECT t.verse_id as verseId, t.researcher_id as researcherId,
           r.display_name as displayName, r.language as language, t.text as text
    FROM translations t
    JOIN researchers r ON r.id = t.researcher_id
    WHERE t.verse_id IN (${idPlaceholders})
  `;
  const params: unknown[] = [...verseIds];

  if (researcherIds !== null) {
    if (researcherIds.length === 0) {
      // Explicitly filtered down to zero researchers: no translations match.
      return verses.map((v) => ({ ...v, translations: [] }));
    }
    sql += ` AND t.researcher_id IN (${researcherIds.map(() => "?").join(",")})`;
    params.push(...researcherIds);
  }
  sql += " ORDER BY r.sort_order";

  const rows = db.prepare(sql).all(...params) as (VerseTranslation & { verseId: number })[];

  const byVerse = new Map<number, VerseTranslation[]>();
  for (const row of rows) {
    const list = byVerse.get(row.verseId) ?? [];
    list.push({
      researcherId: row.researcherId,
      displayName: row.displayName,
      language: row.language,
      text: row.text,
    });
    byVerse.set(row.verseId, list);
  }

  return verses.map((v) => ({ ...v, translations: byVerse.get(v.id) ?? [] }));
}

function escapeFtsPhrase(raw: string): string {
  return raw.trim().replace(/"/g, '""');
}

// Punctuation and verse numbers that hang off the ends of words in the
// phrase text (e.g. "ਚੀਤ ॥੨॥") and shouldn't count as part of the word
// when deciding whether a match is exact.
const WORD_EDGE_PUNCT = /^[॥੦-੯.,;:!?"'()]+|[॥੦-੯.,;:!?"'()]+$/g;

function phraseWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(WORD_EDGE_PUNCT, ""))
    .filter(Boolean);
}

// How closely a verse matches the term that was searched for, best first:
//   0 - the term appears as a whole word ("ਗੋਬਿੰਦ" in "ਗੋਬਿੰਦ ਪੂਰਨ ਆਸ")
//   1 - it appears as the start of a longer word ("ਗੋਬਿੰਦ" in "ਗੋਬਿੰਦੁ")
//   2 - neither, so this verse only turned up via a fuzzy alternate
// Multi-word terms follow the same rule the FTS query uses: every word but
// the last must match exactly, and the last may be a prefix.
const EXACT_WORD_MATCH = 0;
const PREFIX_MATCH = 1;
const ALTERNATE_ONLY_MATCH = 2;

function phraseMatchTier(phrase: string, term: string): number {
  const words = phraseWords(phrase);
  const termWords = phraseWords(term);
  if (termWords.length === 0) return ALTERNATE_ONLY_MATCH;

  const lastTerm = termWords[termWords.length - 1];
  let best = ALTERNATE_ONLY_MATCH;

  for (let i = 0; i + termWords.length <= words.length; i++) {
    let leadingWordsMatch = true;
    for (let j = 0; j < termWords.length - 1; j++) {
      if (words[i + j] !== termWords[j]) {
        leadingWordsMatch = false;
        break;
      }
    }
    if (!leadingWordsMatch) continue;

    const lastWord = words[i + termWords.length - 1];
    if (lastWord === lastTerm) return EXACT_WORD_MATCH;
    if (lastWord.startsWith(lastTerm)) best = PREFIX_MATCH;
  }
  return best;
}

// Accepts multiple candidate phrasings (e.g. a fuzzy-matched primary guess
// plus one or two alternates) and searches for any of them at once, so an
// ambiguous roman query like "satnam" -- which could plausibly mean either
// of two real words -- returns verses matching either, rather than
// committing to a single guess and possibly missing the intended one.
export function searchByPhrase(queries: string | string[], researcherIds: number[] | null): VerseResult[] {
  const candidates = Array.isArray(queries) ? queries : [queries];
  const usable = candidates.filter((q) => q.trim().length > 0);
  if (usable.length === 0) return [];

  const db = getDb();
  const primary = usable[0];
  const alternates = usable.slice(1);

  // The primary reading is searched on its own and given the whole result
  // budget first; alternates only fill what's left over. Searching them all
  // as one OR'd query would let bm25 mix them freely, and a fuzzy alternate
  // that happens to be rarer (so scores higher) could crowd genuine matches
  // for what the user actually typed out of the results entirely.
  const primaryRows = runPhraseQuery(db, [primary], MAX_RESULTS, []);
  const remaining = MAX_RESULTS - primaryRows.length;
  const alternateRows =
    alternates.length > 0 && remaining > 0
      ? runPhraseQuery(
          db,
          alternates,
          remaining,
          primaryRows.map((r) => r.id)
        )
      : [];
  const rows = [...primaryRows, ...alternateRows];

  // Order by how well each verse matches what was actually searched for --
  // exact whole-word hits, then longer words starting with it, then verses
  // that only turned up through a fuzzy alternate -- keeping page order
  // (1-1430) within each group. The tier is computed here rather than in
  // SQL because it needs word-boundary logic that FTS's prefix matching
  // can't express.
  const tiers = new Map(rows.map((r) => [r.id, phraseMatchTier(r.phrase, primary)]));
  rows.sort((a, b) => {
    const tierDiff = tiers.get(a.id)! - tiers.get(b.id)!;
    if (tierDiff !== 0) return tierDiff;
    if (a.page !== b.page) return a.page - b.page;
    return a.verse - b.verse;
  });

  return attachTranslations(rows, researcherIds);
}

// Most relevant verses (by bm25) whose phrase matches any of `terms`,
// optionally skipping ids already claimed by an earlier, higher-priority
// query.
function runPhraseQuery(
  db: ReturnType<typeof getDb>,
  terms: string[],
  limit: number,
  excludeIds: number[]
): Omit<VerseResult, "translations">[] {
  const matchExpr = terms.map((t) => `"${escapeFtsPhrase(t)}"*`).join(" OR ");
  const exclusion =
    excludeIds.length > 0 ? `WHERE v.id NOT IN (${excludeIds.map(() => "?").join(",")})` : "";

  return db
    .prepare(
      `
      SELECT v.id, v.page, v.verse, v.line, v.phrase, MIN(matched.rank) as rank
      FROM (
        SELECT verse_id, bm25(search_fts) as rank
        FROM search_fts
        WHERE text MATCH ? AND source_type = 'phrase'
        LIMIT -1
      ) matched
      JOIN verses v ON v.id = matched.verse_id
      ${exclusion}
      GROUP BY v.id
      ORDER BY rank ASC
      LIMIT ?
      `
    )
    .all(matchExpr, ...excludeIds, limit) as Omit<VerseResult, "translations">[];
}

export function searchByPage(page: number, researcherIds: number[] | null): VerseResult[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, page, verse, line, phrase FROM verses WHERE page = ? ORDER BY verse")
    .all(page) as Omit<VerseResult, "translations">[];

  return attachTranslations(rows, researcherIds);
}

export function searchByInitials(initials: string, researcherIds: number[] | null): VerseResult[] {
  const compact = initials.replace(/\s+/g, "");
  if (!compact) return [];

  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, page, verse, line, phrase FROM verses WHERE phrase_initials_compact LIKE ? ORDER BY page, verse LIMIT ?"
    )
    .all(`${compact}%`, MAX_RESULTS) as Omit<VerseResult, "translations">[];

  return attachTranslations(rows, researcherIds);
}

// The danda can differ between our phrase text and an external source's
// rendering of the same line without the line actually being different, so
// it is dropped before comparing.
//
// Digits are deliberately kept. They used to be stripped along with it,
// which quietly erased the one character that tells "ਸੋਰਠਿ ਮਹਲਾ ੯" from
// "ਸੋਰਠਿ ਮਹਲਾ ੫" -- the number naming which Guru composed the shabad. Both
// sides reduced to "ਸੋਰਠਿ ਮਹਲਾ", tied at distance zero, and whichever came
// first on the Ang won, so a Guru Tegh Bahadur reading could be headed as
// Guru Arjan's.
function normalizeForPhraseMatch(s: string): string {
  return s.replace(/॥/g, "").replace(/\s+/g, " ").trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Matches a run of lines from an external source (a Hukamnama API, whose
// text can differ from ours in trailing punctuation or the occasional
// word-level spelling) against the verses on one Ang, and returns each with
// our own researcher translations attached. Entries are null where nothing
// on the page is close enough.
//
// The lines are matched as a sequence rather than one at a time, because a
// single Ang repeats the same heading once per shabad -- Ang 631 carries
// three separate "ਸੋਰਠਿ ਮਹਲਾ ੯" lines. Matched alone, such a line ties
// against all of them and the first on the page wins, which attaches the
// translations of the wrong shabad. The reading is contiguous, so the lines
// that match unambiguously place the ones that don't.
export function matchVersesInOrder(
  page: number,
  targetPhrases: string[],
  researcherIds: number[] | null
): (VerseResult | null)[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, page, verse, line, phrase FROM verses WHERE page = ? ORDER BY verse")
    .all(page) as Omit<VerseResult, "translations">[];
  if (rows.length === 0) return targetPhrases.map(() => null);

  // Every verse that ties for the closest match to each line.
  const tied = targetPhrases.map((phrase) => {
    const target = normalizeForPhraseMatch(phrase);
    let bestDist = Infinity;
    let best: Omit<VerseResult, "translations">[] = [];
    for (const row of rows) {
      const dist = levenshtein(target, normalizeForPhraseMatch(row.phrase));
      if (dist < bestDist) {
        bestDist = dist;
        best = [row];
      } else if (dist === bestDist) {
        best.push(row);
      }
    }
    const maxAllowed = Math.max(3, target.length * 0.35);
    return bestDist > maxAllowed ? [] : best;
  });

  // A line matching exactly one verse is taken as settled; those anchor the
  // rest.
  const chosen: (Omit<VerseResult, "translations"> | null)[] = tied.map((c) =>
    c.length === 1 ? c[0] : null
  );

  for (let i = 0; i < tied.length; i++) {
    if (chosen[i] || tied[i].length === 0) continue;

    // Nearest settled line in either direction. The reading runs in verse
    // order, so that line's position implies where this one belongs.
    let anchor = -1;
    for (let step = 1; step < tied.length && anchor === -1; step++) {
      if (chosen[i - step]) anchor = i - step;
      else if (chosen[i + step]) anchor = i + step;
    }
    if (anchor === -1) {
      chosen[i] = tied[i][0];
      continue;
    }
    const expected = chosen[anchor]!.verse + (i - anchor);
    chosen[i] = tied[i].reduce((best, row) =>
      Math.abs(row.verse - expected) < Math.abs(best.verse - expected) ? row : best
    );
  }

  // One query for the whole reading rather than one per line.
  const found = chosen.filter((row): row is Omit<VerseResult, "translations"> => row !== null);
  const withTranslations = new Map(
    attachTranslations(found, researcherIds).map((verse) => [verse.id, verse])
  );
  return chosen.map((row) => (row ? withTranslations.get(row.id) ?? null : null));
}
