const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Format an ISO date string using a date format pattern from profile config.
 *
 * Supported tokens: DD, D, MM, M, MMM, MMMM, YYYY, YY
 *
 * Examples:
 *  - "DD/MM/YYYY"  → "14/02/2026"
 *  - "DD MMM YYYY" → "14 Feb 2026"
 *  - "YYYY-MM-DD"  → "2026-02-14"
 *  - "MM/DD/YYYY"  → "02/14/2026"
 */
export function formatDate(iso: string, dateFormat: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const day = d.getDate();
  const month = d.getMonth(); // 0-indexed
  const year = d.getFullYear();

  const tokens: Record<string, string> = {
    YYYY: String(year),
    yyyy: String(year),
    YY: String(year).slice(-2),
    yy: String(year).slice(-2),
    MMMM: FULL_MONTHS[month],
    MMM: SHORT_MONTHS[month],
    MM: String(month + 1).padStart(2, "0"),
    DD: String(day).padStart(2, "0"),
    dd: String(day).padStart(2, "0"),
    D: String(day),
    d: String(day),
    M: String(month + 1),
  };

  // Match longest tokens first to avoid partial replacements
  const pattern = Object.keys(tokens)
    .sort((a, b) => b.length - a.length)
    .join("|");

  return dateFormat.replaceAll(
    new RegExp(pattern, "g"),
    (match) => tokens[match],
  );
}

/**
 * Convert an ISO date string to YYYY-MM-DD for HTML `<input type="date">`.
 */
export function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}
