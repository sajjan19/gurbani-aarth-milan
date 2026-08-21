import { NextRequest, NextResponse } from "next/server";
import { suggestGurmukhi } from "@/lib/gurmukhiSuggest";
import { searchByInitials, searchByPage, searchByPhrase } from "@/lib/search";
import { transliterateLetters } from "@/lib/transliterate";

// The Gurmukhi keyboard offers Gurmukhi numerals and the Punjabi interface
// writes Ang numbers with them, so a page search can legitimately arrive as
// "\u0a6d\u0a69\u0a6d" rather than "737". Folded back to ASCII before parsing.
function foldGurmukhiDigits(text: string): string {
  return text.replace(/[\u0a66-\u0a6f]/g, (d) =>
    String(d.charCodeAt(0) - 0x0a66)
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const q = searchParams.get("q")?.trim() ?? "";
  // Distinguish "param not sent" (null = no filter, show every researcher)
  // from "param sent but empty" (= filter to zero researchers).
  const researchersParam = searchParams.get("researchers");
  const researcherIds =
    researchersParam === null
      ? null
      : researchersParam
          .split(",")
          .map((s) => parseInt(s, 10))
          .filter((n) => Number.isFinite(n));

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  switch (mode) {
    case "phrase": {
      // If the query was typed in roman letters, guess what Gurmukhi it
      // means by snapping each word to the closest real word in the text
      // (e.g. "satnam" -> "ਸਤਿਨਾਮੁ", how it's actually spelled), rather than
      // trusting a naive letter-by-literal reading. When the guess isn't an
      // exact vocabulary match, search it alongside its next-best
      // alternate(s) too, so an ambiguous query still surfaces the verse
      // the user actually meant even if it wasn't the top guess.
      const suggestion = suggestGurmukhi(q);
      const candidates = suggestion ? [suggestion.primary, ...suggestion.alternates] : [q];
      return NextResponse.json({
        results: searchByPhrase(candidates, researcherIds),
        interpretedQuery: suggestion?.primary ?? null,
        exact: suggestion?.exact ?? true,
        alternateQuery: suggestion?.alternates[0] ?? null,
      });
    }
    case "initials": {
      // Each roman letter here is the first letter of its own word (e.g.
      // "ssa" -> ਸ ਸ ਅ), not a syllable to read phonetically, so map each
      // character independently rather than merging vowels into consonants.
      const interpreted = /[A-Za-z]/.test(q) ? transliterateLetters(q) : null;
      const searchQuery = interpreted ?? q;
      return NextResponse.json({
        results: searchByInitials(searchQuery, researcherIds),
        interpretedQuery: interpreted !== q ? interpreted : null,
      });
    }
    case "page": {
      const page = parseInt(foldGurmukhiDigits(q), 10);
      if (!Number.isFinite(page) || page < 1) {
        return NextResponse.json({ error: "Page must be a positive number" }, { status: 400 });
      }
      return NextResponse.json({ results: searchByPage(page, researcherIds) });
    }
    default:
      return NextResponse.json({ error: "mode must be phrase, page, or initials" }, { status: 400 });
  }
}
