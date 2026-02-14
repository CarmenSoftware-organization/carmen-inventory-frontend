import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/profile";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

export const profileQueryKey = ["profile"] as const;

export function useProfile() {
  const router = useRouter();

  const query = useQuery<UserProfile>({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.PROFILE);

      if (res.status === 401) {
        router.push("/login");
        throw new Error("Unauthorized");
      }

      if (!res.ok) throw new Error("Failed to fetch profile");

      const json = await res.json();
      return json.data;
    },
    staleTime: Infinity,
    retry: (_, error) =>
      !(error instanceof Error && error.message === "Unauthorized"),
  });

  const defaultBu = useMemo(
    () => query.data?.business_unit.find((b) => b.is_default),
    [query.data],
  );
  const buCode = defaultBu?.code;
  const allBuCode = useMemo(
    () => query.data?.business_unit.map((b) => b.code),
    [query.data],
  );

  return { ...query, defaultBu, buCode, allBuCode };
}
