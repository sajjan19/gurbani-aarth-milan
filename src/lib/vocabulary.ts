import { getDb } from "./db";

export type VocabWord = { word: string; count: number };

declare global {
  var __gurbaniVocabulary: VocabWord[] | undefined;
}

// Danda/punctuation/verse-number marks that show up glued onto words in the
// phrase column (e.g. "ਸਚੁ ॥੧॥") but aren't part of the word's spelling.
const PUNCTUATION_RE = /[॥ੴ.,;:!?"'()]+/g;
const ONLY_DIGITS_RE = /^[੦-੯]+$/;

function loadVocabulary(): VocabWord[] {
  const db = getDb();
  const rows = db.prepare("SELECT phrase FROM verses").all() as { phrase: string }[];
  const counts = new Map<string, number>();
  for (const { phrase } of rows) {
    for (const raw of phrase.split(/\s+/)) {
      const word = raw.replace(PUNCTUATION_RE, "").trim();
      if (word && !ONLY_DIGITS_RE.test(word)) {
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()].map(([word, count]) => ({ word, count }));
}

// Every distinct word actually used across the phrase column (the Gurmukhi
// verse text from the researcher spreadsheets), with how often each occurs
// -- built once and cached, the same pattern as getDb(), since it's
// read-only and derived from the same static database file. The count lets
// fuzzy matching prefer common words over rare ones when a roman-typed
// query is equally close to both.
export function getVocabulary(): VocabWord[] {
  if (!global.__gurbaniVocabulary) {
    global.__gurbaniVocabulary = loadVocabulary();
  }
  return global.__gurbaniVocabulary;
}
