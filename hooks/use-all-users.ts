import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { User } from "@/types/workflows";
import type { PaginatedResponse } from "@/types/params";
import { CACHE_NORMAL } from "@/lib/cache-config";
import { buildUrl } from "@/utils/build-query-string";

export function useAllUsers() {
  const buCode = useBuCode();

  return useQuery<User[]>({
    queryKey: [QUERY_KEYS.USERS, buCode, "all"],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.USERS(buCode), { perpage: -1 });
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch users");
      const json: PaginatedResponse<User> = await res.json();
      return json.data;
    },
    enabled: !!buCode,
    ...CACHE_NORMAL,
  });
}
