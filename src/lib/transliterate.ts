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
