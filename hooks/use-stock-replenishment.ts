import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constant/query-keys";
import { useBuCode } from "@/hooks/use-bu-code";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import { mockData } from "@/app/(root)/store-operation/stock-replenishment/mock-data";
import type { Locations } from "@/types/stock-replenishment";

// TODO: เปลี่ยนเป็นเรียก API จริง เมื่อ backend พร้อม
// import { API_ENDPOINTS } from "@/constant/api-endpoints";
// import { httpClient } from "@/lib/http-client";

export function useStockReplenishment() {
  const buCode = useBuCode();

  return useQuery<Locations>({
    queryKey: [QUERY_KEYS.STOCK_REPLENISHMENT, buCode],
    queryFn: async () => {
      // TODO: เปลี่ยนเป็น API จริง
      // const res = await httpClient.get(API_ENDPOINTS.STOCK_REPLENISHMENT(buCode!));
      // if (!res.ok) throw new Error("Failed to fetch stock replenishment");
      // const json = await res.json();
      // return json.data;
      return mockData;
    },
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}
