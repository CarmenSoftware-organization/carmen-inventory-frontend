import { useProfile } from "@/hooks/use-profile";
import type { BusinessUnit } from "@/types/profile";

export interface RequiredProfile {
  buCode: string;
  defaultBu: BusinessUnit;
  userId: string;
  aliasName: string;
  defaultCurrencyId: string;
  defaultCurrencyCode: string;
  defaultCurrencyDecimalPlaces: number;
  dateFormat: string;
  hasDepartment: boolean;
}

export function useRequiredProfile(): RequiredProfile | null {
  const profile = useProfile();

  if (!profile.isProfileReady) {
    if (process.env.NODE_ENV === "development") {
      const missing = [
        !profile.buCode && "buCode",
        !profile.defaultBu && "defaultBu",
        !profile.userId && "userId",
      ].filter(Boolean);

      if (missing.length > 0) {
        console.warn(
          "[useRequiredProfile] Profile not ready. Missing:",
          missing.join(", "),
        );
      }
    }
    return null;
  }

  return {
    buCode: profile.buCode!,
    defaultBu: profile.defaultBu!,
    userId: profile.userId!,
    aliasName: profile.aliasName ?? "",
    defaultCurrencyId: profile.defaultCurrencyId ?? "",
    defaultCurrencyCode: profile.defaultCurrencyCode,
    defaultCurrencyDecimalPlaces: profile.defaultCurrencyDecimalPlaces,
    dateFormat: profile.dateFormat,
    hasDepartment: profile.hasDepartment ?? false,
  };
}
