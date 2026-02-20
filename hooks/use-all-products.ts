import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Product } from "@/types/product";
import { CACHE_NORMAL } from "@/lib/cache-config";
import { getAllProducts } from "@/lib/api/products";

export function useAllProducts() {
  const buCode = useBuCode();

  return useQuery<Product[]>({
    queryKey: [QUERY_KEYS.PRODUCTS, buCode, "all"],
    queryFn: () => getAllProducts(buCode!),
    enabled: !!buCode,
    ...CACHE_NORMAL,
  });
}
