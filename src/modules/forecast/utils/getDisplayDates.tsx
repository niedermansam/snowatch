"use client";
export function getDisplayDates(dates: Date[] | string[]): string[] {
  if (dates[0] instanceof Date) {
    const out = dates.map((x) => (x as Date).toLocaleDateString());

    return out;
  } else {
    return dates as string[];
  }
}
