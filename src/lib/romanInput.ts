// Roman-to-Gurmukhi typing for the search box: the reader types on the
// Latin keyboard they have and Gurmukhi appears in the box.
//
// The roman letters are kept as the source of truth rather than being
// discarded once converted, for two separate reasons:
//
//  1. A later keystroke changes how an earlier one reads. "s" is ਸ, but
//     "sh" means that "s" was the opening half of ਸ਼. So the whole buffer
//     is re-read on every keystroke, which needs the original letters --
//     appending to the converted text can't work.
//
//  2. The search API guesses far better from roman than from converted
//     text. It snaps each word to the closest word actually used in the
//     Guru Granth Sahib, so "nanak" finds ਨਾਨਕ (50 verses) where its
//     literal reading ਨਨਕ finds 1. The box shows the reading; the search
//     is given the letters. See suggestGurmukhi.
//
// Gurmukhi sitting in the buffer passes through the converters untouched,
// so text from the on-screen keyboard shares this buffer rather than
// needing a code path of its own.

import { transliterateLetters, transliteratePhonetic } from "./transliterate";

export type TypingMode = "phrase" | "page" | "initials";

export type TypingState = {
  /** What the reader actually typed -- sent to the search API. */
  roman: string;
  /** The Gurmukhi reading of it -- what the box shows. */
  display: string;
};

export function convertTyped(roman: string, mode: TypingMode): string {
  // A page number is digits; letters there are a typo, not something to
  // read as Gurmukhi.
  if (mode === "page") return roman;
  // In "first letters" mode each letter is the initial of its own word, so
  // they map one for one instead of merging into syllables the way whole
  // words do (transliteratePhonetic would read "sa" as a single ਸ).
  return mode === "initials" ? transliterateLetters(roman) : transliteratePhonetic(roman);
}

// Folds one edit of the visible text back into the typed buffer. `previous`
// is the state the box was in; `nextValue` is what the browser left in it
// after the keystroke, paste or deletion.
export function applyTypedInput(
  previous: TypingState,
  nextValue: string,
  mode: TypingMode
): TypingState {
  const convert = (roman: string) => convertTyped(roman, mode);

  // Added at the end: ordinary typing. Append the new letters and re-read
  // the buffer from the start.
  if (nextValue.length > previous.display.length && nextValue.startsWith(previous.display)) {
    const roman = previous.roman + nextValue.slice(previous.display.length);
    return { roman, display: convert(roman) };
  }

  // Removed from the end: backspace. Drop typed letters until the reading
  // is actually shorter, rather than exactly one letter per press. Some
  // keys produce no glyph of their own -- the "a" in "ka" is the inherent
  // vowel, already carried by ਕ -- and a backspace that visibly does
  // nothing reads as a broken box.
  if (nextValue.length < previous.display.length && previous.display.startsWith(nextValue)) {
    let roman = previous.roman;
    while (roman.length > 0 && convert(roman).length > nextValue.length) {
      roman = roman.slice(0, -1);
    }
    return { roman, display: convert(roman) };
  }

  // Everything else: a paste, an edit in the middle, select-all-and-retype.
  // The text becomes its own source -- Latin in it converts, and Gurmukhi
  // passes through, so a mixed edit lands correctly either way.
  return { roman: nextValue, display: convert(nextValue) };
}
