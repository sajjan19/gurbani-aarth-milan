// Phonetic Latin-to-Gurmukhi transliteration, e.g. typing "satnam" produces "ਸਤਨਾਮ".
// One shared table drives both the live transliteration engine and the
// roman-letter captions shown on the virtual Gurmukhi keyboard.

type VowelEntry = { roman: string; independent: string; matra: string };

// Longest roman sequence first within each group so matching is greedy.
const VOWELS: VowelEntry[] = [
  { roman: "aa", independent: "ਆ", matra: "ਾ" },
  { roman: "ai", independent: "ਐ", matra: "ੈ" },
  { roman: "au", independent: "ਔ", matra: "ੌ" },
  { roman: "ee", independent: "ਈ", matra: "ੀ" },
  { roman: "oo", independent: "ਊ", matra: "ੂ" },
  { roman: "a", independent: "ਅ", matra: "" },
  { roman: "i", independent: "ਇ", matra: "ਿ" },
  { roman: "u", independent: "ਉ", matra: "ੁ" },
  { roman: "e", independent: "ਏ", matra: "ੇ" },
  { roman: "o", independent: "ਓ", matra: "ੋ" },
];

const CONSONANTS: { roman: string; gurmukhi: string }[] = [
  { roman: "kh", gurmukhi: "ਖ" },
  { roman: "gh", gurmukhi: "ਘ" },
  { roman: "ng", gurmukhi: "ਙ" },
  { roman: "chh", gurmukhi: "ਛ" },
  { roman: "ch", gurmukhi: "ਚ" },
  { roman: "jh", gurmukhi: "ਝ" },
  { roman: "ny", gurmukhi: "ਞ" },
  { roman: "Th", gurmukhi: "ਠ" },
  { roman: "Dh", gurmukhi: "ਢ" },
  { roman: "th", gurmukhi: "ਥ" },
  { roman: "dh", gurmukhi: "ਧ" },
  { roman: "ph", gurmukhi: "ਫ" },
  { roman: "bh", gurmukhi: "ਭ" },
  { roman: "sh", gurmukhi: "ਸ਼" },
  { roman: "T", gurmukhi: "ਟ" },
  { roman: "D", gurmukhi: "ਡ" },
  { roman: "N", gurmukhi: "ਣ" },
  { roman: "L", gurmukhi: "ੜ" },
  { roman: "K", gurmukhi: "ਖ਼" },
  { roman: "G", gurmukhi: "ਗ਼" },
  { roman: "k", gurmukhi: "ਕ" },
  { roman: "g", gurmukhi: "ਗ" },
  { roman: "c", gurmukhi: "ਚ" },
  { roman: "j", gurmukhi: "ਜ" },
  { roman: "t", gurmukhi: "ਤ" },
  { roman: "d", gurmukhi: "ਦ" },
  { roman: "n", gurmukhi: "ਨ" },
  { roman: "p", gurmukhi: "ਪ" },
  { roman: "b", gurmukhi: "ਬ" },
  { roman: "m", gurmukhi: "ਮ" },
  { roman: "y", gurmukhi: "ਯ" },
  { roman: "r", gurmukhi: "ਰ" },
  { roman: "l", gurmukhi: "ਲ" },
  { roman: "v", gurmukhi: "ਵ" },
  { roman: "w", gurmukhi: "ਵ" },
  { roman: "s", gurmukhi: "ਸ" },
  { roman: "h", gurmukhi: "ਹ" },
  { roman: "f", gurmukhi: "ਫ਼" },
  { roman: "z", gurmukhi: "ਜ਼" },
];

const vowelsByLength = [...VOWELS].sort((a, b) => b.roman.length - a.roman.length);
const consonantsByLength = [...CONSONANTS].sort((a, b) => b.roman.length - a.roman.length);

export function transliterateRoman(input: string): string {
  let result = "";
  let i = 0;
  let afterConsonant = false;

  while (i < input.length) {
    const ch = input[i];

    if (!/[A-Za-z]/.test(ch)) {
      result += ch;
      afterConsonant = false;
      i += 1;
      continue;
    }

    const vowel = vowelsByLength.find((v) => input.startsWith(v.roman, i));
    if (vowel) {
      result += afterConsonant ? vowel.matra : vowel.independent;
      afterConsonant = false;
      i += vowel.roman.length;
      continue;
    }

    const consonant = consonantsByLength.find((c) => input.startsWith(c.roman, i));
    if (consonant) {
      result += consonant.gurmukhi;
      afterConsonant = true;
      i += consonant.roman.length;
      continue;
    }

    result += ch;
    afterConsonant = false;
    i += 1;
  }

  return result;
}

// For the virtual keyboard: which roman letter(s) produce a given Gurmukhi
// character. Independent vowels and matras both show their vowel's roman
// letter (context decides which form typing actually produces).
const ROMAN_LABELS: Record<string, string> = {};
for (const v of VOWELS) {
  if (!(v.independent in ROMAN_LABELS)) ROMAN_LABELS[v.independent] = v.roman;
  if (v.matra && !(v.matra in ROMAN_LABELS)) ROMAN_LABELS[v.matra] = v.roman;
}
for (const c of CONSONANTS) {
  if (!(c.gurmukhi in ROMAN_LABELS)) ROMAN_LABELS[c.gurmukhi] = c.roman;
}

export function romanLabelFor(gurmukhiChar: string): string | undefined {
  return ROMAN_LABELS[gurmukhiChar];
}
