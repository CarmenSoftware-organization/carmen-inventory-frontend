import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/profile";

export const profileQueryKey = ["profile"] as const;

export function useProfile() {
  const router = useRouter();

  return useQuery<UserProfile>({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/proxy/api/user/profile");

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
}
