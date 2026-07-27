import type { Metadata } from "next";
import { getResearchers, matchVerseByPhrase, type VerseResult } from "@/lib/search";
import HukamnamaResults from "./HukamnamaResults";

export const metadata: Metadata = {
  title: "Hukamnama | Gurbani Aarth Milan",
};

// Today's Hukamnama doesn't change through the day, but re-checking hourly
// keeps the page correct across the actual moment it's updated each
// morning without hitting the upstream API on every request.
export const revalidate = 3600;

type HukamnamaLine = {
  line: {
    id: string;
    gurmukhi: { unicode: string };
  };
};

type HukamnamaResponse = {
  date: {
    gregorian: { month: string; date: number; year: number; day: string };
  };
  hukamnamainfo: {
    pageno: number;
    writer?: { unicode: string };
    raag?: { unicode: string };
  };
  hukamnama: HukamnamaLine[];
  error: boolean;
};

// Public Gurbani API run by GurbaniNow (https://gurbaninow.com), used only
// to identify which verses make up today's Hukamnama (its own
// translations aren't used -- see matchVerseByPhrase, which looks each
// line up in our own phrase/translations tables instead).
async function getHukamnama(): Promise<HukamnamaResponse | null> {
  try {
    const res = await fetch("https://api.gurbaninow.com/v2/hukamnama/today", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data: HukamnamaResponse = await res.json();
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function HukamnamaPage() {
  const data = await getHukamnama();
  const researchers = getResearchers();

  // Look each line up on the reported Ang in our own dataset (fuzzy-matched,
  // since an external source's exact text can differ from ours in trailing
  // punctuation or the odd word) so the verse shown carries all of our
  // researchers' translations -- filtering to the selected ones happens
  // client-side in HukamnamaResults, the same way the homepage does it.
  // A line with no close match on the page still gets a placeholder card
  // (synthetic negative id, no translations) so the reading isn't missing
  // a line just because our text diverged from the source's for that one.
  const verses: VerseResult[] =
    data?.hukamnama.map(({ line }, i) => {
      const matched = matchVerseByPhrase(data.hukamnamainfo.pageno, line.gurmukhi.unicode, null);
      return (
        matched ?? {
          id: -(i + 1),
          page: data.hukamnamainfo.pageno,
          verse: 0,
          line: null,
          phrase: line.gurmukhi.unicode,
          translations: [],
        }
      );
    }) ?? [];

  return (
    <main className="page">
      <h1>Hukamnama</h1>

      {!data ? (
        <p className="error">Could not load today&apos;s Hukamnama right now. Please try again later.</p>
      ) : (
        <>
          <p className="hukamnama-meta">
            {data.date.gregorian.day}, {data.date.gregorian.month} {data.date.gregorian.date},{" "}
            {data.date.gregorian.year} — Ang {data.hukamnamainfo.pageno}
            {data.hukamnamainfo.writer && ` · ${data.hukamnamainfo.writer.unicode}`}
            {data.hukamnamainfo.raag && ` · ${data.hukamnamainfo.raag.unicode}`}
          </p>

          <HukamnamaResults verses={verses} researchers={researchers} />
        </>
      )}
    </main>
  );
}
