import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "data", "gurbani.db");

declare global {
  // eslint-disable-next-line no-var
  var __gurbaniDb: Database.Database | undefined;
}

function openDb(): Database.Database {
  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  db.pragma("journal_mode = WAL");
  return db;
}

export function getDb(): Database.Database {
  if (!global.__gurbaniDb) {
    global.__gurbaniDb = openDb();
  }
  return global.__gurbaniDb;
}
