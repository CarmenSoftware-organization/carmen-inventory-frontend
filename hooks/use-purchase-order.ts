import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PurchaseOrder, CreatePoDto } from "@/types/purchase-order";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import * as api from "@/lib/api/purchase-orders";

export function usePurchaseOrder(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<PurchaseOrder>>({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS, buCode, params],
    queryFn: () => api.getPurchaseOrders(buCode!, params),
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function usePurchaseOrderById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<PurchaseOrder>({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS, buCode, id],
    queryFn: () => api.getPurchaseOrderById(buCode!, id!),
    enabled: !!buCode && !!id,
  });
}

export function useCreatePurchaseOrder() {
  return useApiMutation<CreatePoDto>({
    mutationFn: (data, buCode) => api.createPurchaseOrder(buCode, data),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to create purchase order",
  });
}

export function useUpdatePurchaseOrder() {
  return useApiMutation<CreatePoDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      api.updatePurchaseOrder(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to update purchase order",
  });
}

export function useDeletePurchaseOrder() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.deletePurchaseOrder(buCode, id),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to delete purchase order",
  });
}
