/**
 * Shared form helpers for converting between API data types and form text fields.
 */

export const arrayToText = (value: string[] | null | undefined): string => {
  if (!value || value.length === 0) return "";
  return value.join("\n");
};

export const textToArray = (value: string): string[] | null => {
  const items = value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
};

export function objectToText(
  value: Record<string, unknown> | null | undefined,
): string {
  if (!value || Object.keys(value).length === 0) return "";
  return JSON.stringify(value, null, 2);
}

export function textToObject(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// ── Key-value pair helpers ──

export interface KeyValueRow {
  _id: string;
  key: string;
  value: string;
}

let _kvId = 0;

function kvId(): string {
  return `kv_${++_kvId}`;
}

export function createKeyValueRow(key = "", value = ""): KeyValueRow {
  return { _id: kvId(), key, value };
}

export function objectToKeyValues(
  value: Record<string, unknown> | null | undefined,
): KeyValueRow[] {
  if (!value || Object.keys(value).length === 0) return [];
  return Object.entries(value).map(([k, v]) =>
    createKeyValueRow(k, String(v ?? "")),
  );
}

export function keyValuesToObject(
  rows: KeyValueRow[],
): Record<string, unknown> | null {
  const filtered = rows.filter((r) => r.key.trim());
  if (filtered.length === 0) return null;
  const result: Record<string, unknown> = {};
  for (const row of filtered) {
    const k = row.key.trim();
    const v = row.value.trim();
    const num = Number(v);
    if (v !== "" && !Number.isNaN(num)) {
      result[k] = num;
    } else if (v === "true") {
      result[k] = true;
    } else if (v === "false") {
      result[k] = false;
    } else {
      result[k] = v;
    }
  }
  return result;
}
