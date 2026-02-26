import { useEffect } from "react";
import { toast } from "sonner";
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
  const loaded = profile.isSuccess;
  const ready = profile.isProfileReady;

  useEffect(() => {
    if (loaded && !ready) {
      toast.warning("ข้อมูลโปรไฟล์ไม่ครบ กรุณาติดต่อ Admin", {
        id: "profile-incomplete",
      });
    }
  }, [loaded, ready]);

  if (!ready) return null;

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
