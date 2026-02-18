import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { User } from "@/types/workflows";
import type { PaginatedResponse } from "@/types/params";

export function useAllUsers() {
  const { buCode } = useProfile();

  return useQuery<User[]>({
    queryKey: [QUERY_KEYS.USERS, buCode, "all"],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.USERS(buCode)}?perpage=-1`,
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      const json: PaginatedResponse<User> = await res.json();
      return json.data;
    },
    enabled: !!buCode,
  });
}
