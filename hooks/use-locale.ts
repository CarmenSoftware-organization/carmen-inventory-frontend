import { useProfile } from "@/hooks/use-profile";

export function useLocale() {
  const { dateFormat, defaultCurrencyCode, defaultCurrencyDecimalPlaces } =
    useProfile();
  return { dateFormat, defaultCurrencyCode, defaultCurrencyDecimalPlaces };
}
