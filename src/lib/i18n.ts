// Interface translations. The Gurmukhi font is already scoped by
// unicode-range to Gurmukhi codepoints, so Punjabi strings pick it up
// automatically without any extra styling.
//
// NOTE: the Punjabi here was written by the developer, not a native
// speaker. It is worth a review pass by someone at the institute before
// this is shown widely.

export type Lang = "en" | "pa";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];

const GURMUKHI_DIGITS = ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"];

// Ang and verse numbers are written in Gurmukhi numerals throughout the Guru
// Granth Sahib itself, so Western digits sitting inside otherwise-Gurmukhi
// text read as a jarring switch. Only used for display -- inputs and the
// values sent to the API stay Western.
export function formatNumber(value: number | string, lang: Lang): string {
  const text = String(value);
  if (lang !== "pa") return text;
  return text.replace(/[0-9]/g, (d) => GURMUKHI_DIGITS[Number(d)]);
}

export const translations = {
  en: {
    nav: {
      search: "Search",
      hukamnama: "Hukamnama",
      about: "About",
      feedback: "Feedback",
      contact: "Contact",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      language: "Language",
    },
    search: {
      title: "Gurbani Aarth Milan",
      modePhrase: "Word / Phrase",
      modePage: "Page Number",
      modeInitials: "First Letters",
      placeholderPhrase: "Search a word or phrase in Gurmukhi...",
      placeholderPage: "Enter a page (Ang) number, 1-1430",
      placeholderInitials: "Type the first letter of each word, e.g. ਸਸਅ (spaces optional)",
      toggleKeyboard: "Toggle Gurmukhi keyboard",
      searchAction: "Search",
      showingResultsFor: "Showing results for",
      didYouMean: "Did you mean",
      noMatches: "No matches found.",
      pageRangeError: "Please enter a page number between 1 and 1430.",
      searchFailed: "Search failed. Please try again.",
    },
    keyboard: {
      backspace: "Backspace",
      clear: "Clear",
      space: "Space",
    },
    filters: {
      trigger: "Filter by researcher",
      selectedCount: (selected: number, total: number) => `(${selected} of ${total} selected)`,
      noneWarning: "No researchers selected — results won't show any translations.",
      selectAll: "Select all",
      clearAll: "Clear all",
      punjabi: "Punjabi",
      english: "English",
      all: "All",
      none: "None",
      done: "Done",
      close: "Close",
      researchers: "Researchers",
      noTranslations: "No translations selected for this verse.",
    },
    nav2: {
      previous: "Previous",
      next: "Next",
      page: "Page",
      verse: "Verse",
      returnToTop: "Return to top",
      scrollToTop: "Scroll to top",
    },
    hukamnama: {
      title: "Daily Hukamnama",
      ang: "Ang",
      loadError: "Could not load today's Hukamnama right now. Please try again later.",
      noMatch: "No matching translation found in our database for this line.",
    },
    about: {
      title: "About Gurbani Aarth Milan",
      subtitle: "A project by Guru Nanak Institute of Global Studies",
      imageAlt: "Hands resting on an open Guru Granth Sahib",
      p1: "Gurbani Aarth Milan is a search tool for the Guru Granth Sahib. Rather than showing a single translation for each verse, it brings together interpretations from 15 researchers (8 in Punjabi and 7 in English) side by side, so readers can compare how different scholars have understood the same line.",
      p2: "You can search by phrase or word (in Gurmukhi or in translation), by page (Ang) number, or by typing just the first letter of each word. Results can be filtered to show only the researchers you're interested in.",
      p3Before: "This is an early version of the project, and it will keep growing. If you have feedback, corrections, or questions, reach out on the ",
      p3Link: "contact page",
      p3After: ".",
    },
    contact: {
      title: "Contact Us",
      name: "Name",
      email: "Your email",
      phone: "Phone number",
      optional: "(optional)",
      message: "Message",
      send: "Send Message",
      sending: "Sending…",
      thanks: (name: string) => `Thanks, ${name} — your message is on its way.`,
      recapName: "Name",
      recapEmail: "Email",
      recapPhone: "Phone",
      recapMessage: "Message",
      sendAnother: "Send another message",
      failed: "Failed to send message. Please try again.",
    },
    feedback: {
      title: "Feedback",
      subtitle: "Help us improve Gurbani Aarth Milan — tell us what you found.",
      name: "Name",
      email: "Your email",
      phone: "Phone number",
      optional: "(optional)",
      describe: "Tell us what happened",
      describePlaceholder: "What you expected, and what you saw instead.",
      photos: "Photos",
      photosHint: (max: number) => `(optional, up to ${max})`,
      removePhoto: (filename: string) => `Remove ${filename}`,
      send: "Send Feedback",
      sending: "Sending…",
      thanks: "Thank you — your feedback has been sent.",
      thanksBody:
        "It goes straight to the team behind Gurbani Aarth Milan. If we need to ask anything further, we'll reply to the email address you gave.",
      sendAnother: "Send more feedback",
      failed: "Failed to send feedback. Please try again.",
      tooMany: (max: number) => `You can attach up to ${max} photos.`,
      tooBig: (filename: string) => `${filename} is too large — please keep photos under 5MB.`,
    },
  },

  pa: {
    nav: {
      search: "ਖੋਜ",
      hukamnama: "ਹੁਕਮਨਾਮਾ",
      about: "ਸਾਡੇ ਬਾਰੇ",
      feedback: "ਸੁਝਾਅ",
      contact: "ਸੰਪਰਕ",
      openMenu: "ਮੀਨੂ ਖੋਲ੍ਹੋ",
      closeMenu: "ਮੀਨੂ ਬੰਦ ਕਰੋ",
      language: "ਭਾਸ਼ਾ",
    },
    search: {
      title: "ਗੁਰਬਾਣੀ ਅਰਥ ਮਿਲਾਨ",
      modePhrase: "ਸ਼ਬਦ / ਤੁਕ",
      modePage: "ਅੰਗ ਨੰਬਰ",
      modeInitials: "ਪਹਿਲੇ ਅੱਖਰ",
      placeholderPhrase: "ਗੁਰਮੁਖੀ ਵਿੱਚ ਸ਼ਬਦ ਜਾਂ ਤੁਕ ਖੋਜੋ...",
      placeholderPage: "ਅੰਗ ਨੰਬਰ ਭਰੋ, ੧-੧੪੩੦",
      placeholderInitials: "ਹਰ ਸ਼ਬਦ ਦਾ ਪਹਿਲਾ ਅੱਖਰ ਲਿਖੋ, ਜਿਵੇਂ ਸਸਅ",
      toggleKeyboard: "ਗੁਰਮੁਖੀ ਕੀਬੋਰਡ",
      searchAction: "ਖੋਜੋ",
      showingResultsFor: "ਇਸ ਲਈ ਨਤੀਜੇ",
      didYouMean: "ਕੀ ਤੁਹਾਡਾ ਮਤਲਬ ਸੀ",
      noMatches: "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ।",
      pageRangeError: "ਕਿਰਪਾ ਕਰਕੇ ੧ ਤੋਂ ੧੪੩੦ ਵਿਚਕਾਰ ਅੰਗ ਨੰਬਰ ਭਰੋ।",
      searchFailed: "ਖੋਜ ਅਸਫਲ ਰਹੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    },
    keyboard: {
      backspace: "ਮਿਟਾਓ",
      clear: "ਸਾਫ਼ ਕਰੋ",
      space: "ਖਾਲੀ ਥਾਂ",
    },
    filters: {
      trigger: "ਖੋਜਕਾਰ ਅਨੁਸਾਰ ਛਾਂਟੋ",
      selectedCount: (selected: number, total: number) =>
        `(${formatNumber(total, "pa")} ਵਿੱਚੋਂ ${formatNumber(selected, "pa")} ਚੁਣੇ)`,
      noneWarning: "ਕੋਈ ਖੋਜਕਾਰ ਨਹੀਂ ਚੁਣਿਆ — ਨਤੀਜਿਆਂ ਵਿੱਚ ਕੋਈ ਅਰਥ ਨਹੀਂ ਦਿਖੇਗਾ।",
      selectAll: "ਸਾਰੇ ਚੁਣੋ",
      clearAll: "ਸਾਰੇ ਹਟਾਓ",
      punjabi: "ਪੰਜਾਬੀ",
      english: "ਅੰਗਰੇਜ਼ੀ",
      all: "ਸਾਰੇ",
      none: "ਕੋਈ ਨਹੀਂ",
      done: "ਹੋ ਗਿਆ",
      close: "ਬੰਦ ਕਰੋ",
      researchers: "ਖੋਜਕਾਰ",
      noTranslations: "ਇਸ ਤੁਕ ਲਈ ਕੋਈ ਅਰਥ ਨਹੀਂ ਚੁਣਿਆ।",
    },
    nav2: {
      previous: "ਪਿੱਛੇ",
      next: "ਅੱਗੇ",
      page: "ਅੰਗ",
      verse: "ਤੁਕ",
      returnToTop: "ਉੱਪਰ ਜਾਓ",
      scrollToTop: "ਉੱਪਰ ਜਾਓ",
    },
    hukamnama: {
      title: "ਰੋਜ਼ਾਨਾ ਹੁਕਮਨਾਮਾ",
      ang: "ਅੰਗ",
      loadError: "ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      noMatch: "ਇਸ ਤੁਕ ਲਈ ਸਾਡੇ ਡਾਟਾਬੇਸ ਵਿੱਚ ਕੋਈ ਅਰਥ ਨਹੀਂ ਮਿਲਿਆ।",
    },
    about: {
      title: "ਗੁਰਬਾਣੀ ਅਰਥ ਮਿਲਾਨ ਬਾਰੇ",
      subtitle: "ਗੁਰੂ ਨਾਨਕ ਇੰਸਟੀਚਿਊਟ ਆਫ਼ ਗਲੋਬਲ ਸਟੱਡੀਜ਼ ਦਾ ਇੱਕ ਪ੍ਰੋਜੈਕਟ",
      imageAlt: "ਖੁੱਲ੍ਹੇ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਉੱਤੇ ਹੱਥ",
      p1: "ਗੁਰਬਾਣੀ ਅਰਥ ਮਿਲਾਨ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਲਈ ਇੱਕ ਖੋਜ ਸਾਧਨ ਹੈ। ਹਰ ਤੁਕ ਲਈ ਇੱਕੋ ਅਰਥ ਦਿਖਾਉਣ ਦੀ ਥਾਂ, ਇਹ ੧੫ ਖੋਜਕਾਰਾਂ (੮ ਪੰਜਾਬੀ ਅਤੇ ੭ ਅੰਗਰੇਜ਼ੀ) ਦੇ ਅਰਥ ਨਾਲ-ਨਾਲ ਦਿਖਾਉਂਦਾ ਹੈ, ਤਾਂ ਜੋ ਪਾਠਕ ਵੇਖ ਸਕਣ ਕਿ ਵੱਖ-ਵੱਖ ਵਿਦਵਾਨਾਂ ਨੇ ਉਸੇ ਤੁਕ ਨੂੰ ਕਿਵੇਂ ਸਮਝਿਆ ਹੈ।",
      p2: "ਤੁਸੀਂ ਸ਼ਬਦ ਜਾਂ ਤੁਕ ਰਾਹੀਂ (ਗੁਰਮੁਖੀ ਜਾਂ ਅਰਥ ਵਿੱਚ), ਅੰਗ ਨੰਬਰ ਰਾਹੀਂ, ਜਾਂ ਹਰ ਸ਼ਬਦ ਦਾ ਪਹਿਲਾ ਅੱਖਰ ਲਿਖ ਕੇ ਖੋਜ ਸਕਦੇ ਹੋ। ਨਤੀਜਿਆਂ ਨੂੰ ਛਾਂਟ ਕੇ ਸਿਰਫ਼ ਉਹੀ ਖੋਜਕਾਰ ਵੇਖੇ ਜਾ ਸਕਦੇ ਹਨ ਜਿਨ੍ਹਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਦਿਲਚਸਪੀ ਹੈ।",
      p3Before: "ਇਹ ਪ੍ਰੋਜੈਕਟ ਦਾ ਸ਼ੁਰੂਆਤੀ ਰੂਪ ਹੈ ਅਤੇ ਇਹ ਵਧਦਾ ਰਹੇਗਾ। ਜੇ ਤੁਹਾਡੇ ਕੋਲ ਸੁਝਾਅ, ਸੋਧਾਂ ਜਾਂ ਸਵਾਲ ਹਨ ਤਾਂ ",
      p3Link: "ਸੰਪਰਕ ਪੰਨੇ",
      p3After: " ਰਾਹੀਂ ਦੱਸੋ।",
    },
    contact: {
      title: "ਸੰਪਰਕ ਕਰੋ",
      name: "ਨਾਮ",
      email: "ਤੁਹਾਡੀ ਈਮੇਲ",
      phone: "ਫ਼ੋਨ ਨੰਬਰ",
      optional: "(ਵਿਕਲਪਿਕ)",
      message: "ਸੁਨੇਹਾ",
      send: "ਸੁਨੇਹਾ ਭੇਜੋ",
      sending: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
      thanks: (name: string) => `ਧੰਨਵਾਦ, ${name} — ਤੁਹਾਡਾ ਸੁਨੇਹਾ ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ।`,
      recapName: "ਨਾਮ",
      recapEmail: "ਈਮੇਲ",
      recapPhone: "ਫ਼ੋਨ",
      recapMessage: "ਸੁਨੇਹਾ",
      sendAnother: "ਹੋਰ ਸੁਨੇਹਾ ਭੇਜੋ",
      failed: "ਸੁਨੇਹਾ ਭੇਜਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    },
    feedback: {
      title: "ਸੁਝਾਅ",
      subtitle: "ਗੁਰਬਾਣੀ ਅਰਥ ਮਿਲਾਨ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰੋ — ਸਾਨੂੰ ਦੱਸੋ ਕੀ ਮਿਲਿਆ।",
      name: "ਨਾਮ",
      email: "ਤੁਹਾਡੀ ਈਮੇਲ",
      phone: "ਫ਼ੋਨ ਨੰਬਰ",
      optional: "(ਵਿਕਲਪਿਕ)",
      describe: "ਸਾਨੂੰ ਦੱਸੋ ਕੀ ਹੋਇਆ",
      describePlaceholder: "ਤੁਸੀਂ ਕੀ ਉਮੀਦ ਕੀਤੀ ਸੀ, ਅਤੇ ਇਸ ਦੀ ਥਾਂ ਕੀ ਦਿਖਿਆ।",
      photos: "ਤਸਵੀਰਾਂ",
      photosHint: (max: number) => `(ਵਿਕਲਪਿਕ, ਵੱਧ ਤੋਂ ਵੱਧ ${formatNumber(max, "pa")})`,
      removePhoto: (filename: string) => `${filename} ਹਟਾਓ`,
      send: "ਸੁਝਾਅ ਭੇਜੋ",
      sending: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
      thanks: "ਧੰਨਵਾਦ — ਤੁਹਾਡਾ ਸੁਝਾਅ ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ।",
      thanksBody:
        "ਇਹ ਸਿੱਧਾ ਗੁਰਬਾਣੀ ਅਰਥ ਮਿਲਾਨ ਦੀ ਟੀਮ ਕੋਲ ਪਹੁੰਚਦਾ ਹੈ। ਜੇ ਸਾਨੂੰ ਹੋਰ ਕੁਝ ਪੁੱਛਣਾ ਪਿਆ ਤਾਂ ਅਸੀਂ ਤੁਹਾਡੀ ਦਿੱਤੀ ਈਮੇਲ ਉੱਤੇ ਜਵਾਬ ਦੇਵਾਂਗੇ।",
      sendAnother: "ਹੋਰ ਸੁਝਾਅ ਭੇਜੋ",
      failed: "ਸੁਝਾਅ ਭੇਜਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      tooMany: (max: number) =>
        `ਤੁਸੀਂ ਵੱਧ ਤੋਂ ਵੱਧ ${formatNumber(max, "pa")} ਤਸਵੀਰਾਂ ਜੋੜ ਸਕਦੇ ਹੋ।`,
      tooBig: (filename: string) => `${filename} ਬਹੁਤ ਵੱਡੀ ਹੈ — ਕਿਰਪਾ ਕਰਕੇ ਤਸਵੀਰਾਂ ੫MB ਤੋਂ ਘੱਟ ਰੱਖੋ।`,
    },
  },
} as const;

export type Translation = (typeof translations)["en"];
