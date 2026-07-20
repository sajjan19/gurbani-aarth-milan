import { NextRequest, NextResponse } from "next/server";
import { searchByInitials, searchByPage, searchByPhrase } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const q = searchParams.get("q")?.trim() ?? "";
  const researchersParam = searchParams.get("researchers");
  const researcherIds = researchersParam
    ? researchersParam
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isFinite(n))
    : null;

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  switch (mode) {
    case "phrase":
      return NextResponse.json({ results: searchByPhrase(q, researcherIds) });
    case "initials":
      return NextResponse.json({ results: searchByInitials(q, researcherIds) });
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
