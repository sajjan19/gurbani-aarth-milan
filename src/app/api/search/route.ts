import { NextRequest, NextResponse } from "next/server";
import { suggestGurmukhi } from "@/lib/gurmukhiSuggest";
import { searchByInitials, searchByPage, searchByPhrase } from "@/lib/search";
import { transliterateLetters } from "@/lib/transliterate";

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
      // trusting a naive letter-by-letter reading -- then search with that.
      const interpreted = suggestGurmukhi(q);
      const searchQuery = interpreted ?? q;
      return NextResponse.json({
        results: searchByPhrase(searchQuery, researcherIds),
        interpretedQuery: interpreted,
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
      const page = parseInt(q, 10);
      if (!Number.isFinite(page) || page < 1) {
        return NextResponse.json({ error: "Page must be a positive number" }, { status: 400 });
      }
      return NextResponse.json({ results: searchByPage(page, researcherIds) });
    }
    default:
      return NextResponse.json({ error: "mode must be phrase, page, or initials" }, { status: 400 });
  }
}
