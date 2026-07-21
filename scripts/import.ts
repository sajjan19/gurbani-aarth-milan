// Reads every xlsx file in data/source-xlsx and loads it into data/gurbani.db.
// Re-run any time the source spreadsheets change: `npm run import`.
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import * as XLSX from "xlsx";

const PROJECT_ROOT = path.join(__dirname, "..");
const SOURCE_DIR = path.join(PROJECT_ROOT, "data", "source-xlsx");
const DB_PATH = path.join(PROJECT_ROOT, "data", "gurbani.db");
const SCHEMA_PATH = path.join(PROJECT_ROOT, "data", "schema.sql");

// Column order matches the spreadsheet headers exactly.
const RESEARCHERS: { key: string; displayName: string; language: "pa" | "en" }[] = [
  { key: "ਸ਼ਬਦਾਰਥ", displayName: "ਸ਼ਬਦਾਰਥ", language: "pa" },
  { key: "ਫਰੀਦਕੋਟੀ", displayName: "ਫਰੀਦਕੋਟੀ", language: "pa" },
  { key: "ਸੰਥਯਾ", displayName: "ਸੰਥਯਾ", language: "pa" },
  { key: "ਸਟੀਕ", displayName: "ਸਟੀਕ", language: "pa" },
  { key: "ਦਰਪਣ", displayName: "ਦਰਪਣ", language: "pa" },
  { key: "ਨਿਰਣੈ", displayName: "ਨਿਰਣੈ", language: "pa" },
  { key: "ਸਿਧਾਂਤਕ", displayName: "ਸਿਧਾਂਤਕ", language: "pa" },
  { key: "ਅਰਥ ਬੋਧ", displayName: "ਅਰਥ ਬੋਧ", language: "pa" },
  { key: "Gopal S", displayName: "Gopal Singh", language: "en" },
  { key: "Manmahoan S", displayName: "Manmohan Singh", language: "en" },
  { key: "Talib", displayName: "Gurbachan Singh Talib", language: "en" },
  { key: "Khalsa", displayName: "Sant Singh Khalsa", language: "en" },
  { key: "Darshan S", displayName: "Darshan Singh", language: "en" },
  { key: "Santhia Pothian", displayName: "Santhia Pothian", language: "en" },
  { key: "Kartar S", displayName: "Kartar Singh", language: "en" },
];

function computeInitials(phrase: string): string[] {
  const tokens = phrase.split(/\s+/).filter(Boolean);
  const initials: string[] = [];
  for (const token of tokens) {
    const match = token.match(/[਀-੿A-Za-z]/);
    if (match) initials.push(match[0]);
  }
  return initials;
}

function main() {
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));

  const insertResearcher = db.prepare(
    "INSERT INTO researchers (key, display_name, language, sort_order) VALUES (?, ?, ?, ?)"
  );
  const researcherIds = new Map<string, number>();
  RESEARCHERS.forEach((r, i) => {
    const info = insertResearcher.run(r.key, r.displayName, r.language, i);
    researcherIds.set(r.key, info.lastInsertRowid as number);
  });

  const insertVerse = db.prepare(
    "INSERT INTO verses (page, verse, line, phrase, phrase_initials, phrase_initials_compact) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertTranslation = db.prepare(
    "INSERT INTO translations (verse_id, researcher_id, text) VALUES (?, ?, ?)"
  );
  const insertFts = db.prepare(
    "INSERT INTO search_fts (text, verse_id, source_type, researcher_id) VALUES (?, ?, ?, ?)"
  );

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith(".xlsx"))
    .sort((a, b) => parseInt(a) - parseInt(b));

  let verseCount = 0;
  let translationCount = 0;
  let skipped = 0;

  const importAll = db.transaction(() => {
    for (const file of files) {
      const wb = XLSX.readFile(path.join(SOURCE_DIR, file));
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
      });

      for (const row of rows) {
        const page = row["Page"];
        const verse = row["Verse"];
        const line = row["Line"];
        const phrase = row["Phrase"];

        if (
          typeof page !== "number" ||
          typeof verse !== "number" ||
          typeof phrase !== "string" ||
          !phrase.trim()
        ) {
          skipped++;
          continue;
        }

        const initials = computeInitials(phrase);
        const verseInfo = insertVerse.run(
          page,
          verse,
          typeof line === "number" ? line : null,
          phrase,
          initials.join(" "),
          initials.join("")
        );
        const verseId = verseInfo.lastInsertRowid as number;
        verseCount++;

        insertFts.run(phrase, verseId, "phrase", null);

        for (const r of RESEARCHERS) {
          const text = row[r.key];
          if (typeof text !== "string" || !text.trim()) continue;
          const researcherId = researcherIds.get(r.key)!;
          insertTranslation.run(verseId, researcherId, text);
          insertFts.run(text, verseId, "translation", researcherId);
          translationCount++;
        }
      }
    }
  });

  importAll();

  console.log(`Imported ${verseCount} verses, ${translationCount} translations from ${files.length} files.`);
  if (skipped) console.log(`Skipped ${skipped} rows with missing page/verse/phrase.`);

  db.close();
}

main();
