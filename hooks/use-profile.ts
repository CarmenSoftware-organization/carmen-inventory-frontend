import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/profile";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import { httpClient } from "@/lib/http-client";

export const profileQueryKey = [QUERY_KEYS.PROFILE] as const;

export function useProfile() {
  const router = useRouter();

  const query = useQuery<UserProfile>({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const res = await httpClient.get(API_ENDPOINTS.PROFILE);

      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch profile");

      const json = await res.json();
      return json.data;
    },
    staleTime: Infinity,
    retry: (_, error) =>
      !(error instanceof Error && error.message === "Unauthorized"),
  });

  useEffect(() => {
    if (query.error?.message === "Unauthorized") {
      router.push("/login");
    }
  }, [query.error, router]);

  const defaultBu = useMemo(
    () =>
      query.data?.business_unit.find((b) => b.is_default) ??
      query.data?.business_unit[0],
    [query.data],
  );

  const userId = query.data?.id;
  const buCode = defaultBu?.code;
  const defaultCurrencyCode = defaultBu?.config.default_currency.code;
  const defaultCurrencyDecimalPlaces =
    defaultBu?.config.default_currency.decimal_places;
  const dateFormat = defaultBu?.config.date_format ?? "DD/MM/YYYY";
  const allBuCode = useMemo(
    () => query.data?.business_unit.map((b) => b.code),
    [query.data],
  );

  return {
    ...query,
    defaultBu,
    buCode,
    defaultCurrencyCode,
    defaultCurrencyDecimalPlaces,
    dateFormat,
    allBuCode,
    userId,
  };
}
