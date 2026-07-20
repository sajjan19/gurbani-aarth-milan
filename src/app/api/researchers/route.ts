import { NextResponse } from "next/server";
import { getResearchers } from "@/lib/search";

export async function GET() {
  return NextResponse.json({ researchers: getResearchers() });
}
