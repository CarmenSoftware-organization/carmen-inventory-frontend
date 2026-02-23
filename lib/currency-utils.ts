export function formatCurrency(
  value: number,
  decimals: number = 2,
): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatExchangeRate(
  rate: number | null | undefined,
  decimalPlaces?: number | null,
  currencyCode?: string | null,
): string {
  if (!rate) return "-";

  const converted = 1 / rate;
  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces ?? 2,
    maximumFractionDigits: decimalPlaces ?? 4,
  });

  return currencyCode ? `${formatted} ${currencyCode}` : formatted;
}
