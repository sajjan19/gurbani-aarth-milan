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

// Accepts multiple candidate phrasings (e.g. a fuzzy-matched primary guess
// plus one or two alternates) and searches for any of them at once, so an
// ambiguous roman query like "satnam" -- which could plausibly mean either
// of two real words -- returns verses matching either, rather than
// committing to a single guess and possibly missing the intended one.
export function searchByPhrase(queries: string | string[], researcherIds: number[] | null): VerseResult[] {
  const candidates = Array.isArray(queries) ? queries : [queries];
  const matchExpr = candidates
    .map((q) => escapeFtsPhrase(q))
    .filter(Boolean)
    .map((q) => `"${q}"*`)
    .join(" OR ");
  if (!matchExpr) return [];

  const db = getDb();

  // Pick the most relevant matches by bm25 rank first, then display that
  // set in page order (1-1430) rather than by relevance.
  const rows = db
    .prepare(
      `
      SELECT * FROM (
        SELECT v.id, v.page, v.verse, v.line, v.phrase, MIN(matched.rank) as rank
        FROM (
          SELECT verse_id, bm25(search_fts) as rank
          FROM search_fts
          WHERE text MATCH ? AND source_type = 'phrase'
          LIMIT -1
        ) matched
        JOIN verses v ON v.id = matched.verse_id
        GROUP BY v.id
        ORDER BY rank ASC
        LIMIT ?
      )
      ORDER BY page ASC, verse ASC
      `
    )
    .all(matchExpr, MAX_RESULTS) as Omit<VerseResult, "translations">[];

  return attachTranslations(rows, researcherIds);
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

// Punctuation/verse-number marks that can differ between our phrase text
// and an external source's rendering of the same line (e.g. a trailing
// danda present in one but not the other) without the underlying line
// actually being different -- stripped before comparing.
function normalizeForPhraseMatch(s: string): string {
  return s.replace(/[॥੦-੯]/g, "").replace(/\s+/g, " ").trim();
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

// Finds the verse on `page` whose phrase text most closely matches
// `targetPhrase` (from an external source, e.g. a Hukamnama API, whose
// exact text can differ from ours in trailing punctuation or an occasional
// word-level spelling) and returns it with our own researcher translations
// attached -- for stitching external Gurbani text back to our own dataset's
// translations rather than trusting whatever came with it. Returns null if
// nothing on the page is a close enough match.
export function matchVerseByPhrase(
  page: number,
  targetPhrase: string,
  researcherIds: number[] | null
): VerseResult | null {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, page, verse, line, phrase FROM verses WHERE page = ?")
    .all(page) as Omit<VerseResult, "translations">[];
  if (rows.length === 0) return null;

  const target = normalizeForPhraseMatch(targetPhrase);
  let best: Omit<VerseResult, "translations"> | null = null;
  let bestDist = Infinity;
  for (const row of rows) {
    const dist = levenshtein(target, normalizeForPhraseMatch(row.phrase));
    if (dist < bestDist) {
      bestDist = dist;
      best = row;
    }
  }

  const maxAllowed = Math.max(3, target.length * 0.35);
  if (!best || bestDist > maxAllowed) return null;

  return attachTranslations([best], researcherIds)[0];
}
