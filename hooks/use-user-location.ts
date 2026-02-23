import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { CACHE_STATIC } from "@/lib/cache-config";
import type { Location } from "@/types/location";
import type { PaginatedResponse } from "@/types/params";

export function useUserLocation() {
  const buCode = useBuCode();

  return useQuery<Location[]>({
    queryKey: [QUERY_KEYS.USER_LOCATIONS, buCode],
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.USER_LOCATIONS(buCode!), {
        perpage: -1,
      });
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch user locations");
      const json: PaginatedResponse<Location> = await res.json();
      return json.data;
    },
    enabled: !!buCode,
    ...CACHE_STATIC,
  });
}
