// The published work behind each of the 15 translations, transcribed from
// the institute's own reference list ("ਨਾਵਾਂ ਦੀ ਸੂਚੀ").
//
// Each citation is reproduced as the document writes it -- same order of
// elements, same capitalisation, same punctuation -- rather than being
// rearranged into a uniform template. The document is not internally
// consistent (the Punjabi entries name the work before its author, the
// English ones the author first), and that is the institute's own house
// style to settle, not this file's.
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
  /** The rest of the line, verbatim. */
  citation: string;
};

export const RESEARCHER_SOURCES: ResearcherSource[] = [
  {
    number: 1,
    name: "ਸ਼ਬਦਾਰਥ",
    citation:
      "ਸ਼ਬਦਾਰਥ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ, 4 ਭਾਗ, ਪ੍ਰਿੰ. ਤੇਜਾ ਸਿੰਘ ਤੇ ਸਾਥੀ (1936) 1979 (ਸ਼੍ਰੋਮਣੀ ਗੁਰਦੁਆਰਾ ਪ੍ਰਬੰਧਕ ਕਮੇਟੀ, ਅੰਮ੍ਰਿਤਸਰ)।",
  },
  {
    number: 2,
    name: "ਫਰੀਦਕੋਟੀ",
    citation:
      "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਆਦਿ ਸਟੀਕ, 4 ਭਾਗ, ਗਿ. ਬਦਨ ਸਿੰਘ (1963 ਸੰਮਤ; 1906) 1970 (ਭਾਸ਼ਾ ਵਿਭਾਗ, ਪੰਜਾਬ, ਪਟਿਆਲਾ, ਡਿਜੀਟਲ ਵਰਜ਼ਨ)।",
  },
  {
    number: 3,
    name: "ਸੰਥਯਾ",
    citation:
      "ਸੰਥਯਾ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ, 7 ਭਾਗ - ਭਾਈ ਵੀਰ ਸਿੰਘ (1958), 2007 (ਭਾਈ ਵੀਰ ਸਿੰਘ ਸਾਹਿਤ ਸਦਨ, ਭਾਈ ਵੀਰ ਸਿੰਘ ਮਾਰਗ, ਨਵੀਂ ਦਿੱਲੀ)।",
  },
  {
    number: 4,
    name: "ਸਟੀਕ",
    citation:
      ", ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਸਟੀਕ, 8 ਭਾਗ, ਗਿ. ਬਿਸ਼ਨ ਸਿੰਘ (1934) 1934 (ਭਾਈ ਜਵਾਹਰ ਸਿੰਘ ਐਂਡ ਸਨਜ਼, ਅੰਮ੍ਰਿਤਸਰ)।",
  },
  {
    number: 5,
    name: "ਦਰਪਣ",
    citation:
      "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ, 10 ਭਾਗ, ਪ੍ਰੋ. ਸਾਹਿਬ ਸਿੰਘ (1963), 1972 (ਰਾਜ ਪਬਲਿਸ਼ਰਜ਼ ਰਜਿ:, ਜਲੰਧਰ)।",
  },
  {
    number: 6,
    name: "ਨਿਰਣੈ",
    citation:
      "ਆਦਿ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਸ਼ਨ ਨਿਰਣੈ ਸਟੀਕ, 14 ਭਾਗ, ਗਿ. ਹਰਬੰਸ ਸਿੰਘ, (1980) 2011 (ਗੁਰਬਾਣੀ ਸੇਵਾ ਪ੍ਰਕਾਸ਼ਨ, ਪਟਿਆਲਾ)",
  },
  {
    number: 7,
    name: "ਸਿਧਾਂਤਕ",
    citation:
      "ਸਿਧਾਂਤਕ ਸਟੀਕ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, 8 ਭਾਗ, ਗਿ. ਮਨੀ ਸਿੰਘ (1980) 1980 (ਪ੍ਰਕਾਸ਼ਕ ਸੰਸਥਾ ਪ੍ਰਮਾਰਥ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ੧੦੦੮ ਗਲੀ ਸ਼ਹੀਦ ਬੁੰਗਾ, ਅੰਮ੍ਰਿਤਸਰ)।",
  },
  {
    number: 8,
    name: "ਅਰਥ ਬੋਧ",
    citation:
      "ਅਰਥ ਬੋਧ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ, 5 ਭਾਗ, ਡਾ. ਰਤਨ ਸਿੰਘ ਜੱਗੀ (2007) 2007 (ਆਰਸੀ ਪਬਲਿਸ਼ਰਜ਼,ਦਿੱਲੀ)।",
  },
  {
    number: 9,
    name: "Gopal S.",
    citation:
      "Gopal Singh, Sri Guru Granth Sahib [English Version], 4 vols. (1960) 2005 (Allied Publishers Pvt. Limited, New Delhi).",
  },
  {
    number: 10,
    name: "Manmohan S",
    citation:
      "Manmohan Singh, Sri Guru Granth Sahib (English and Panjabi Translation), 8 vols. (1960) 2009 (Shiromani Gurdwara Parbandhak Committee, Sri Amritsar)",
  },
  {
    number: 11,
    name: "Talib",
    citation:
      "GURBACHAN SINGH TALIB, SRI GURU GRANTH SAHIB IN ENGLISH TRANSLATION, 4 vols. (1995) 2004 (Punjabi University, Patiala, Punjab).",
  },
  {
    number: 12,
    name: "Khalsa",
    citation:
      "Sant Singh Khalsa, Sentence By Sentence English Translation of Siri Guru Granth Sahib (Translation Text), ND (online version)",
  },
  {
    number: 13,
    name: "Darshan S",
    citation:
      "Dr. Darshan Singh, Guru Granth Sahib Line to Line (Gurmukhi Text, Roman Transliteration & English Translation, 5 vols. (2010) ND (Sikh University Press, Belgium/Singh Brothers Amritsar).",
  },
  {
    number: 14,
    name: "Santhia Pothian",
    citation: "ਗੁਰਬਾਣੀ ਸੰਥਿਆ ਪਾਠ, 8 vols., ND (Malaysia).",
  },
  {
    number: 15,
    name: "Kartar S",
    citation:
      "Kartar Singh Duggal, The Holy Granth SRI GURU GRANTH SAHIB, 4 vols., (2000) 2004 (Hemkunt Publishers P Ltd., New Delhi).",
  },
];
