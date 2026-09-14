// The published work behind each of the 15 translations, transcribed from
// the institute's own reference list ("ਨਾਵਾਂ ਦੀ ਸੂਚੀ").
//
// These are bibliographic citations, not interface copy, so they are not
// translated: a Punjabi commentary keeps its Gurmukhi title and an English
// one its English title in both language modes, the way a citation is
// written anywhere else. Only the heading and introduction around the list
// follow the reader's language.
//
// `number` is the position shown beside the name in the filter list and on
// every translation line, so a reader who sees "10." in the results can
// find who that is here. It has to stay in step with the researcher order
// in scripts/import.ts.
//
// Years appear as the source gives them -- the first in parentheses is the
// original edition and the second the edition consulted. "ND" is the
// source's own marking for an undated work.

export type ResearcherSource = {
  number: number;
  /** The short name shown throughout the app. */
  name: string;
  author?: string;
  title: string;
  volumes?: string;
  years: string;
  publisher: string;
};

export const RESEARCHER_SOURCES: ResearcherSource[] = [
  {
    number: 1,
    name: "ਸ਼ਬਦਾਰਥ",
    author: "ਪ੍ਰਿੰ. ਤੇਜਾ ਸਿੰਘ ਤੇ ਸਾਥੀ",
    title: "ਸ਼ਬਦਾਰਥ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ",
    volumes: "4 ਭਾਗ",
    years: "(1936) 1979",
    publisher: "ਸ਼੍ਰੋਮਣੀ ਗੁਰਦੁਆਰਾ ਪ੍ਰਬੰਧਕ ਕਮੇਟੀ, ਅੰਮ੍ਰਿਤਸਰ",
  },
  {
    number: 2,
    name: "ਫਰੀਦਕੋਟੀ",
    author: "ਗਿ. ਬਦਨ ਸਿੰਘ",
    title: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਆਦਿ ਸਟੀਕ",
    volumes: "4 ਭਾਗ",
    years: "(1963 ਸੰਮਤ; 1906) 1970",
    publisher: "ਭਾਸ਼ਾ ਵਿਭਾਗ, ਪੰਜਾਬ, ਪਟਿਆਲਾ, ਡਿਜੀਟਲ ਵਰਜ਼ਨ",
  },
  {
    number: 3,
    name: "ਸੰਥਯਾ",
    author: "ਭਾਈ ਵੀਰ ਸਿੰਘ",
    title: "ਸੰਥਯਾ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ",
    volumes: "7 ਭਾਗ",
    years: "(1958) 2007",
    publisher: "ਭਾਈ ਵੀਰ ਸਿੰਘ ਸਾਹਿਤ ਸਦਨ, ਭਾਈ ਵੀਰ ਸਿੰਘ ਮਾਰਗ, ਨਵੀਂ ਦਿੱਲੀ",
  },
  {
    number: 4,
    name: "ਸਟੀਕ",
    author: "ਗਿ. ਬਿਸ਼ਨ ਸਿੰਘ",
    title: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਸਟੀਕ",
    volumes: "8 ਭਾਗ",
    years: "(1934) 1934",
    publisher: "ਭਾਈ ਜਵਾਹਰ ਸਿੰਘ ਐਂਡ ਸਨਜ਼, ਅੰਮ੍ਰਿਤਸਰ",
  },
  {
    number: 5,
    name: "ਦਰਪਣ",
    author: "ਪ੍ਰੋ. ਸਾਹਿਬ ਸਿੰਘ",
    title: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ",
    volumes: "10 ਭਾਗ",
    years: "(1963) 1972",
    publisher: "ਰਾਜ ਪਬਲਿਸ਼ਰਜ਼ ਰਜਿ:, ਜਲੰਧਰ",
  },
  {
    number: 6,
    name: "ਨਿਰਣੈ",
    author: "ਗਿ. ਹਰਬੰਸ ਸਿੰਘ",
    title: "ਆਦਿ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਸ਼ਨ ਨਿਰਣੈ ਸਟੀਕ",
    volumes: "14 ਭਾਗ",
    years: "(1980) 2011",
    publisher: "ਗੁਰਬਾਣੀ ਸੇਵਾ ਪ੍ਰਕਾਸ਼ਨ, ਪਟਿਆਲਾ",
  },
  {
    number: 7,
    name: "ਸਿਧਾਂਤਕ",
    author: "ਗਿ. ਮਨੀ ਸਿੰਘ",
    title: "ਸਿਧਾਂਤਕ ਸਟੀਕ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ",
    volumes: "8 ਭਾਗ",
    years: "(1980) 1980",
    publisher:
      "ਪ੍ਰਕਾਸ਼ਕ ਸੰਸਥਾ ਪ੍ਰਮਾਰਥ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ੧੦੦੮ ਗਲੀ ਸ਼ਹੀਦ ਬੁੰਗਾ, ਅੰਮ੍ਰਿਤਸਰ",
  },
  {
    number: 8,
    name: "ਅਰਥ ਬੋਧ",
    author: "ਡਾ. ਰਤਨ ਸਿੰਘ ਜੱਗੀ",
    title: "ਅਰਥ ਬੋਧ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ",
    volumes: "5 ਭਾਗ",
    years: "(2007) 2007",
    publisher: "ਆਰਸੀ ਪਬਲਿਸ਼ਰਜ਼, ਦਿੱਲੀ",
  },
  {
    number: 9,
    name: "Gopal S",
    author: "Gopal Singh",
    title: "Sri Guru Granth Sahib [English Version]",
    volumes: "4 vols.",
    years: "(1960) 2005",
    publisher: "Allied Publishers Pvt. Limited, New Delhi",
  },
  {
    number: 10,
    name: "Manmohan S",
    author: "Manmohan Singh",
    title: "Sri Guru Granth Sahib (English and Panjabi Translation)",
    volumes: "8 vols.",
    years: "(1960) 2009",
    publisher: "Shiromani Gurdwara Parbandhak Committee, Sri Amritsar",
  },
  {
    number: 11,
    name: "Talib",
    author: "Gurbachan Singh Talib",
    title: "Sri Guru Granth Sahib in English Translation",
    volumes: "4 vols.",
    years: "(1995) 2004",
    publisher: "Punjabi University, Patiala, Punjab",
  },
  {
    number: 12,
    name: "Khalsa",
    author: "Sant Singh Khalsa",
    title:
      "Sentence By Sentence English Translation of Siri Guru Granth Sahib (Translation Text)",
    years: "ND",
    publisher: "online version",
  },
  {
    number: 13,
    name: "Darshan S",
    author: "Dr. Darshan Singh",
    title:
      "Guru Granth Sahib Line to Line (Gurmukhi Text, Roman Transliteration & English Translation)",
    volumes: "5 vols.",
    years: "(2010) ND",
    publisher: "Sikh University Press, Belgium / Singh Brothers, Amritsar",
  },
  {
    number: 14,
    name: "Santhia Pothian",
    title: "ਗੁਰਬਾਣੀ ਸੰਖਿਆ ਪਾਠ",
    volumes: "8 vols.",
    years: "ND",
    publisher: "Malaysia",
  },
  {
    number: 15,
    name: "Kartar S",
    author: "Kartar Singh Duggal",
    title: "The Holy Granth Sri Guru Granth Sahib",
    volumes: "4 vols.",
    years: "(2000) 2004",
    publisher: "Hemkunt Publishers P Ltd., New Delhi",
  },
];
