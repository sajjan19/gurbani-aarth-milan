// Strict 1:1 Latin-to-Gurmukhi key mapping: every mapped roman letter
// (case-sensitive) produces exactly one Gurmukhi character, and every
// Gurmukhi character has exactly one roman trigger. No digraphs (no "kh",
// no "aa") -- this is a direct remapped keyboard layout, not a phonetic
// guesser. Unmapped keys (digits, punctuation, space) pass through as-is,
// which keeps page-number search typing plain numbers.
//
// The four rarest characters (ੳ, ੲ, ਃ, ੍) are left unmapped -- with only
// 52 case-sensitive Latin letters and 52 characters wanting a slot, these
// were the ones cut; they're still reachable via the virtual keyboard.
const ENTRIES: { roman: string; gurmukhi: string }[] = [
  // Consonants
  { roman: "a", gurmukhi: "ਅ" },
  { roman: "s", gurmukhi: "ਸ" },
  { roman: "h", gurmukhi: "ਹ" },
  { roman: "k", gurmukhi: "ਕ" },
  { roman: "K", gurmukhi: "ਖ" },
  { roman: "g", gurmukhi: "ਗ" },
  { roman: "G", gurmukhi: "ਘ" },
  { roman: "Z", gurmukhi: "ਙ" },
  { roman: "c", gurmukhi: "ਚ" },
  { roman: "C", gurmukhi: "ਛ" },
  { roman: "j", gurmukhi: "ਜ" },
  { roman: "J", gurmukhi: "ਝ" },
  { roman: "Y", gurmukhi: "ਞ" },
  { roman: "w", gurmukhi: "ਟ" },
  { roman: "W", gurmukhi: "ਠ" },
  { roman: "q", gurmukhi: "ਡ" },
  { roman: "Q", gurmukhi: "ਢ" },
  { roman: "x", gurmukhi: "ਣ" },
  { roman: "t", gurmukhi: "ਤ" },
  { roman: "T", gurmukhi: "ਥ" },
  { roman: "d", gurmukhi: "ਦ" },
  { roman: "D", gurmukhi: "ਧ" },
  { roman: "n", gurmukhi: "ਨ" },
  { roman: "p", gurmukhi: "ਪ" },
  { roman: "P", gurmukhi: "ਫ" },
  { roman: "b", gurmukhi: "ਬ" },
  { roman: "B", gurmukhi: "ਭ" },
  { roman: "m", gurmukhi: "ਮ" },
  { roman: "y", gurmukhi: "ਯ" },
  { roman: "r", gurmukhi: "ਰ" },
  { roman: "l", gurmukhi: "ਲ" },
  { roman: "v", gurmukhi: "ਵ" },
  { roman: "R", gurmukhi: "ੜ" },
  { roman: "L", gurmukhi: "ਲ਼" },
  { roman: "S", gurmukhi: "ਸ਼" },
  { roman: "X", gurmukhi: "ਖ਼" },
  { roman: "A", gurmukhi: "ਗ਼" },
  { roman: "z", gurmukhi: "ਜ਼" },
  { roman: "f", gurmukhi: "ਫ਼" },
  // Vowel signs / diacritics
  { roman: "H", gurmukhi: "ਾ" },
  { roman: "i", gurmukhi: "ਿ" },
  { roman: "I", gurmukhi: "ੀ" },
  { roman: "u", gurmukhi: "ੁ" },
  { roman: "U", gurmukhi: "ੂ" },
  { roman: "e", gurmukhi: "ੇ" },
  { roman: "E", gurmukhi: "ੈ" },
  { roman: "o", gurmukhi: "ੋ" },
  { roman: "O", gurmukhi: "ੌ" },
  { roman: "N", gurmukhi: "ਂ" },
  { roman: "M", gurmukhi: "ੰ" },
  { roman: "F", gurmukhi: "ੱ" },
  { roman: "V", gurmukhi: "਼" },
];

const ROMAN_TO_GURMUKHI: Record<string, string> = {};
const GURMUKHI_TO_ROMAN: Record<string, string> = {};
for (const { roman, gurmukhi } of ENTRIES) {
  ROMAN_TO_GURMUKHI[roman] = gurmukhi;
  GURMUKHI_TO_ROMAN[gurmukhi] = roman;
}

// Looks up a single typed character; returns the Gurmukhi character it
// produces, or undefined if this key isn't mapped (caller should let it
// pass through untouched, e.g. digits for page-number search).
export function gurmukhiForRoman(char: string): string | undefined {
  return ROMAN_TO_GURMUKHI[char];
}

// For the virtual keyboard: which roman letter produces a given Gurmukhi
// character (the exact inverse of gurmukhiForRoman, since the map is 1:1).
export function romanLabelFor(gurmukhiChar: string): string | undefined {
  return GURMUKHI_TO_ROMAN[gurmukhiChar];
}

// For "first letters" search: each typed roman letter is the first letter
// of a separate word (e.g. "ssa" -> ਸ ਸ ਅ, one letter per word), so this
// maps every character independently via the strict 1:1 table above rather
// than reading it as a single phonetic syllable the way transliteratePhonetic
// would (which -- correctly, for whole-word typing -- would merge "sa" into
// one syllable and read the trailing "a" as an inherent vowel instead of an
// ਅ of its own). Unmapped characters (digits, spaces, punctuation) pass
// through unchanged.
export function transliterateLetters(input: string): string {
  return [...input].map((ch) => gurmukhiForRoman(ch) ?? ch).join("");
}

// --- Phonetic best-guess engine, used for typing in the search box -------
//
// Separate from the strict 1:1 map above (which stays as-is for the virtual
// keyboard's letter captions). This is a natural-spelling guesser: typing
// "satnaam" produces "ਸਤਨਾਮ", using common digraphs (kh, sh, aa, ai, ...)
// and case only where it distinguishes a genuinely different sound
// (retroflex ਟ/ਡ/ਣ vs dental ਤ/ਦ/ਨ, and nukta ਖ਼/ਗ਼/ਲ਼ loan sounds). It won't
// always produce the "correct" spelling -- nasalization in particular is
// ambiguous from roman text alone -- but search only needs a close guess.
type VowelEntry = { roman: string; independent: string; matra: string };

const PHONETIC_VOWELS: VowelEntry[] = [
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

const PHONETIC_CONSONANTS: { roman: string; gurmukhi: string }[] = [
  { roman: "kh", gurmukhi: "ਖ" },
  { roman: "gh", gurmukhi: "ਘ" },
  { roman: "ch", gurmukhi: "ਛ" },
  { roman: "jh", gurmukhi: "ਝ" },
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
  { roman: "R", gurmukhi: "ੜ" },
  { roman: "K", gurmukhi: "ਖ਼" },
  { roman: "G", gurmukhi: "ਗ਼" },
  { roman: "L", gurmukhi: "ਲ਼" },
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
  { roman: "z", gurmukhi: "ਜ਼" },
  { roman: "f", gurmukhi: "ਫ਼" },
];

const vowelsByLength = [...PHONETIC_VOWELS].sort((a, b) => b.roman.length - a.roman.length);
const consonantsByLength = [...PHONETIC_CONSONANTS].sort((a, b) => b.roman.length - a.roman.length);

// Re-transliterates the whole buffer on every call (cheap at search-box
// length) rather than trying to append incrementally, since a later
// keystroke can change how an earlier one should have been read -- e.g.
// "s" alone is ਸ, but "sh" retroactively means the "s" was the start of ਸ਼.
export function transliteratePhonetic(input: string): string {
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

    // Unmapped letter (shouldn't normally happen -- every a-z/A-Z is
    // covered above): pass it through rather than silently dropping it.
    result += ch;
    afterConsonant = false;
    i += 1;
  }

  return result;
}
