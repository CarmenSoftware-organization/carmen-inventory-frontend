import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/types/profile";

export const profileQueryKey = ["profile"] as const;

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/proxy/api/user/profile");

      if (!res.ok) throw new Error("Failed to fetch profile");

      const json = await res.json();
      return json.data;
    },
    staleTime: Infinity,
  });
}
