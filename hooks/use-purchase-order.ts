import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PurchaseOrder, CreatePoDto } from "@/types/purchase-order";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";

export function usePurchaseOrder(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<PurchaseOrder>>({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.PURCHASE_ORDER(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      return res.json();
    },
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function usePurchaseOrderById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<PurchaseOrder>({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch purchase order");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreatePurchaseOrder() {
  return useApiMutation<CreatePoDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.PURCHASE_ORDER(buCode), data),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to create purchase order",
  });
}

export function useUpdatePurchaseOrder() {
  return useApiMutation<CreatePoDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(
        `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}`,
        data,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to update purchase order",
  });
}

export function useDeletePurchaseOrder() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(
        `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}`,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to delete purchase order",
  });
}
