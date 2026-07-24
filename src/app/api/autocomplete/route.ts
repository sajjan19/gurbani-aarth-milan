import { NextRequest, NextResponse } from "next/server";
import { getAutocompleteSuggestions } from "@/lib/autocomplete";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ suggestions: [] });
  return NextResponse.json({ suggestions: getAutocompleteSuggestions(q) });
}
