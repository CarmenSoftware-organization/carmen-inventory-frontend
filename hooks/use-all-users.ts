import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { User } from "@/types/workflows";
import type { PaginatedResponse } from "@/types/params";
import { CACHE_NORMAL } from "@/lib/cache-config";
import { ApiError } from "@/lib/api-error";

export function useAllUsers() {
  const buCode = useBuCode();

  return useQuery<User[]>({
    queryKey: [QUERY_KEYS.USERS, buCode, "all"],
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.USERS(buCode!), { perpage: -1 });
      const res = await httpClient.get(url);
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch users");
      const json: PaginatedResponse<User> = await res.json();
      return json.data;
    },
    enabled: !!buCode,
    ...CACHE_NORMAL,
  });
}
