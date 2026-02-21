import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { QUERY_KEYS } from "@/constant/query-keys";
import { CACHE_STATIC } from "@/lib/cache-config";
import { getProductUnits, type ProductUnit } from "@/lib/api/products";

export type { ProductUnit };

export function useProductUnits(productId: string | undefined) {
  const buCode = useBuCode();

  return useQuery<ProductUnit[]>({
    queryKey: [QUERY_KEYS.PRODUCT_UNITS, buCode, productId],
    queryFn: () => getProductUnits(buCode!, productId!),
    enabled: !!buCode && !!productId,
    ...CACHE_STATIC,
  });
}
