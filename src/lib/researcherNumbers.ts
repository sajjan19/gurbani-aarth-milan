// Researchers are numbered 1-15 so one can be referred to by position --
// "number 4" rather than a name that may be transliterated differently by
// different readers. The same number has to appear in the filter list and
// on every translation line for that to be worth anything, and those are
// rendered in two separate places (search results and the Hukamnama), so
// the numbering lives here rather than being worked out twice.
//
// Numbered by the order the researchers come back in -- sort_order from
// the database -- not by row id. The two happen to line up today, but
// sort_order is the column that decides the display order, and a
// renumbering there should move the labels with it.

export function numberResearchers(researchers: { id: number }[]): Map<number, number> {
  return new Map(researchers.map((researcher, index) => [researcher.id, index + 1]));
}
