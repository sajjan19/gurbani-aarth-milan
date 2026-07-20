-- Researchers who produced a translation (Punjabi or English)
CREATE TABLE researchers (
  id INTEGER PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,        -- original spreadsheet column header
  display_name TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('pa', 'en')),
  sort_order INTEGER NOT NULL
);

-- One row per verse of the Guru Granth Sahib
CREATE TABLE verses (
  id INTEGER PRIMARY KEY,
  page INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  line INTEGER,
  phrase TEXT NOT NULL,
  phrase_initials TEXT NOT NULL,   -- space-separated first letter of each word, for initials search
  UNIQUE (page, verse)
);

CREATE INDEX idx_verses_page ON verses (page);
CREATE INDEX idx_verses_initials ON verses (phrase_initials);

-- A researcher's translation of a given verse (absent = not yet translated)
CREATE TABLE translations (
  id INTEGER PRIMARY KEY,
  verse_id INTEGER NOT NULL REFERENCES verses (id),
  researcher_id INTEGER NOT NULL REFERENCES researchers (id),
  text TEXT NOT NULL,
  UNIQUE (verse_id, researcher_id)
);

CREATE INDEX idx_translations_verse ON translations (verse_id);
CREATE INDEX idx_translations_researcher ON translations (researcher_id);

-- Full-text index over the original phrase and every translation,
-- so a single search can match Gurmukhi verses or any researcher's wording.
CREATE VIRTUAL TABLE search_fts USING fts5(
  text,
  verse_id UNINDEXED,
  source_type UNINDEXED,           -- 'phrase' or 'translation'
  researcher_id UNINDEXED,         -- NULL for phrase rows
  tokenize = 'unicode61'
);
