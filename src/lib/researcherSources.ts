// The published work behind each of the 15 translations, transcribed from
// the institute's own reference list ("ਨਾਵਾਂ ਦੀ ਸੂਚੀ").
//
// Each citation is reproduced as the document writes it -- same order of
// elements, same capitalisation, same punctuation, and the title in italics
// as the source sets it -- rather than being rearranged into a uniform
// template. The document is not internally consistent (the Punjabi entries
// name the work before its author, the English ones the author first), and
// that is the institute's own house style to settle, not this file's.
//
// They are not translated either. A Punjabi commentary keeps its Gurmukhi
// title and an English translation its English title in both language
// modes, the way a citation is written anywhere else.
//
// Gurmukhi here uses the precomposed nukta letters (ਸ਼ U+0A36, ਜ਼ U+0A5B),
// matching the database and the source spreadsheets. The decomposed
// sequences look identical on screen but are different strings -- the same
// trap scripts/import.ts documents for the researcher keys.
//
// `number` is the position shown beside the name in the filter list and on
// every translation line, so a reader who sees "10." in the results can
// find who that is here. It has to stay in step with the researcher order
// in scripts/import.ts.

export type ResearcherSource = {
  number: number;
  /** The short name, set in bold as the source does. */
  name: string;
  /** What runs between the name and the title -- the author, where the
   *  source puts it first. Includes its own leading space. */
  before?: string;
  /** The work's title, italicised as the source sets it. */
  title: string;
  /** The remainder of the line. */
  after: string;
};

export const RESEARCHER_SOURCES: ResearcherSource[] = [
  {
    number: 1,
    name: "ਸ਼ਬਦਾਰਥ",
    title: "ਸ਼ਬਦਾਰਥ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ",
    after: ", 4 ਭਾਗ, ਪ੍ਰਿੰ. ਤੇਜਾ ਸਿੰਘ ਤੇ ਸਾਥੀ (1936) 1979 (ਸ਼੍ਰੋਮਣੀ ਗੁਰਦੁਆਰਾ ਪ੍ਰਬੰਧਕ ਕਮੇਟੀ, ਅੰਮ੍ਰਿਤਸਰ)।",
  },
  {
    number: 2,
    name: "ਫਰੀਦਕੋਟੀ",
    title: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਆਦਿ ਸਟੀਕ",
    after: ", 4 ਭਾਗ, ਗਿ. ਬਦਨ ਸਿੰਘ (1963 ਸੰਮਤ; 1906) 1970 (ਭਾਸ਼ਾ ਵਿਭਾਗ, ਪੰਜਾਬ, ਪਟਿਆਲਾ, ਡਿਜੀਟਲ ਵਰਜ਼ਨ)।",
  },
  {
    number: 3,
    name: "ਸੰਥਯਾ",
    title: "ਸੰਥਯਾ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ",
    after:
      ", 7 ਭਾਗ - ਭਾਈ ਵੀਰ ਸਿੰਘ (1958), 2007 (ਭਾਈ ਵੀਰ ਸਿੰਘ ਸਾਹਿਤ ਸਦਨ, ਭਾਈ ਵੀਰ ਸਿੰਘ ਮਾਰਗ, ਨਵੀਂ ਦਿੱਲੀ)।",
  },
  {
    number: 4,
    name: "ਸਟੀਕ",
    before: ", ",
    title: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਸਟੀਕ",
    after: ", 8 ਭਾਗ, ਗਿ. ਬਿਸ਼ਨ ਸਿੰਘ (1934) 1934 (ਭਾਈ ਜਵਾਹਰ ਸਿੰਘ ਐਂਡ ਸਨਜ਼, ਅੰਮ੍ਰਿਤਸਰ)।",
  },
  {
    number: 5,
    name: "ਦਰਪਣ",
    title: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ",
    after: ", 10 ਭਾਗ, ਪ੍ਰੋ. ਸਾਹਿਬ ਸਿੰਘ (1963), 1972 (ਰਾਜ ਪਬਲਿਸ਼ਰਜ਼ ਰਜਿ:, ਜਲੰਧਰ)।",
  },
  {
    number: 6,
    name: "ਨਿਰਣੈ",
    title: "ਆਦਿ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਸ਼ਨ ਨਿਰਣੈ ਸਟੀਕ",
    after: ", 14 ਭਾਗ, ਗਿ. ਹਰਬੰਸ ਸਿੰਘ, (1980) 2011 (ਗੁਰਬਾਣੀ ਸੇਵਾ ਪ੍ਰਕਾਸ਼ਨ, ਪਟਿਆਲਾ)",
  },
  {
    number: 7,
    name: "ਸਿਧਾਂਤਕ",
    title: "ਸਿਧਾਂਤਕ ਸਟੀਕ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ",
    after:
      ", 8 ਭਾਗ, ਗਿ. ਮਨੀ ਸਿੰਘ (1980) 1980 (ਪ੍ਰਕਾਸ਼ਕ ਸੰਸਥਾ ਪ੍ਰਮਾਰਥ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ੧੦੦੮ ਗਲੀ ਸ਼ਹੀਦ ਬੁੰਗਾ, ਅੰਮ੍ਰਿਤਸਰ)।",
  },
  {
    number: 8,
    name: "ਅਰਥ ਬੋਧ",
    title: "ਅਰਥ ਬੋਧ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ",
    after: ", 5 ਭਾਗ, ਡਾ. ਰਤਨ ਸਿੰਘ ਜੱਗੀ (2007) 2007 (ਆਰਸੀ ਪਬਲਿਸ਼ਰਜ਼,ਦਿੱਲੀ)।",
  },
  {
    number: 9,
    name: "Gopal S.",
    before: " Gopal Singh, ",
    title: "Sri Guru Granth Sahib [English Version]",
    after: ", 4 vols. (1960) 2005 (Allied Publishers Pvt. Limited, New Delhi).",
  },
  {
    number: 10,
    name: "Manmohan S",
    before: " Manmohan Singh, ",
    title: "Sri Guru Granth Sahib (English and Panjabi Translation)",
    after: ", 8 vols. (1960) 2009 (Shiromani Gurdwara Parbandhak Committee, Sri Amritsar)",
  },
  {
    number: 11,
    name: "Talib",
    before: " GURBACHAN SINGH TALIB, ",
    title: "SRI GURU GRANTH SAHIB IN ENGLISH TRANSLATION",
    after: ", 4 vols. (1995) 2004 (Punjabi University, Patiala, Punjab).",
  },
  {
    number: 12,
    name: "Khalsa",
    before: " Sant Singh Khalsa, ",
    title: "Sentence By Sentence English Translation of Siri Guru Granth Sahib",
    after: " (Translation Text), ND (online version)",
  },
  {
    number: 13,
    name: "Darshan S",
    before: " Dr. Darshan Singh, ",
    title:
      "Guru Granth Sahib Line to Line (Gurmukhi Text, Roman Transliteration & English Translation",
    after: ", 5 vols. (2010) ND (Sikh University Press, Belgium/Singh Brothers Amritsar).",
  },
  {
    number: 14,
    name: "Santhia Pothian",
    title: "ਗੁਰਬਾਣੀ ਸੰਥਿਆ ਪਾਠ",
    after: ", 8 vols., ND (Malaysia).",
  },
  {
    number: 15,
    name: "Kartar S",
    before: " Kartar Singh Duggal, ",
    title: "The Holy Granth SRI GURU GRANTH SAHIB",
    after: ", 4 vols., (2000) 2004 (Hemkunt Publishers P Ltd., New Delhi).",
  },
];
