import type { Metadata } from "next";
import { getResearchers, matchVerseByPhrase, type VerseResult } from "@/lib/search";
import HukamnamaResults from "./HukamnamaResults";

export const metadata: Metadata = {
  title: "Hukamnama | Gurbani Aarth Milan",
};

// Rendered fresh on every request rather than cached. A timed revalidate
// is the usual choice, but it serves stale-while-revalidate: the first
// visitor after the cache expires still gets the *previous* page while the
// new one regenerates behind them. For a once-a-day reading that means the
// first person each morning reliably sees yesterday's Hukamnama, which is
// exactly the thing this page must never do. The upstream call is one
// small JSON fetch and the verse matching is local, so paying it per
// request is the right trade for always showing today's reading.
export const dynamic = "force-dynamic";

type HukamnamaLine = {
  line: {
    id: string;
    gurmukhi: { unicode: string };
  };
};

type HukamnamaResponse = {
  date: {
    gregorian: { month: string; date: number; year: number; day: string };
    // The API already publishes the Nanakshahi date in Gurmukhi, so Punjabi
    // readers get a real Nanakshahi date rather than a transliterated
    // Gregorian one.
    nanakshahi?: {
      punjabi?: { month: string; date: string; year: string; day: string };
    };
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
      cache: "no-store",
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

  const gregorian = data
    ? `${data.date.gregorian.day}, ${data.date.gregorian.month} ${data.date.gregorian.date}, ${data.date.gregorian.year}`
    : "";
  const pa = data?.date.nanakshahi?.punjabi;
  const nanakshahi = pa ? `${pa.day}, ${pa.month} ${pa.date}, ${pa.year}` : "";

  return (
    <HukamnamaResults
      verses={verses}
      researchers={researchers}
      loaded={data !== null}
      gregorianDate={gregorian}
      nanakshahiDate={nanakshahi}
      pageNo={data?.hukamnamainfo.pageno ?? 0}
      writer={data?.hukamnamainfo.writer?.unicode ?? ""}
      raag={data?.hukamnamainfo.raag?.unicode ?? ""}
    />
  );
}
