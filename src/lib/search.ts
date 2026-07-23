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

export function searchByPhrase(query: string, researcherIds: number[] | null): VerseResult[] {
  const escaped = escapeFtsPhrase(query);
  if (!escaped) return [];

  const db = getDb();
  const matchExpr = `"${escaped}"*`;

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
