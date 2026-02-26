import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { PurchaseOrder, CreatePoDto } from "@/types/purchase-order";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import type { CommentAttachment, CommentItem } from "@/components/ui/comment-sheet";
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

export function useApprovePurchaseOrder() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.approvePurchaseOrder(buCode, id),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to approve purchase order",
  });
}

export function useCancelPurchaseOrder() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.cancelPurchaseOrder(buCode, id),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to cancel purchase order",
  });
}

export function useClosePurchaseOrder() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.closePurchaseOrder(buCode, id),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDERS],
    errorMessage: "Failed to close purchase order",
  });
}

// --- Comments ---

export function usePurchaseOrderComments(poId: string | undefined) {
  const buCode = useBuCode();

  return useQuery<CommentItem[]>({
    queryKey: [QUERY_KEYS.PURCHASE_ORDER_COMMENTS, buCode, poId],
    queryFn: async () => {
      if (!buCode || !poId) throw new Error("Missing buCode or poId");
      const res = await httpClient.get(
        `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${poId}/comment`,
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!poId,
  });
}

interface CreatePurchaseOrderCommentDto {
  purchase_order_id: string;
  message: string;
  type: string;
  attachments: CommentAttachment[];
}

export function useCreatePurchaseOrderComment() {
  return useApiMutation<CreatePurchaseOrderCommentDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.PURCHASE_ORDER_COMMENT(buCode), data),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDER_COMMENTS],
    errorMessage: "Failed to add comment",
  });
}

export function useUpdatePurchaseOrderComment() {
  return useApiMutation<{
    id: string;
    message: string;
    attachments: CommentAttachment[];
  }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.patch(
        `${API_ENDPOINTS.PURCHASE_ORDER_COMMENT(buCode)}/${id}`,
        data,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDER_COMMENTS],
    errorMessage: "Failed to update comment",
  });
}

export function useDeletePurchaseOrderComment() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(
        `${API_ENDPOINTS.PURCHASE_ORDER_COMMENT(buCode)}/${id}`,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_ORDER_COMMENTS],
    errorMessage: "Failed to delete comment",
  });
}

export async function uploadPoCommentAttachment(
  buCode: string,
  poId: string,
  file: File,
): Promise<CommentAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    API_ENDPOINTS.PURCHASE_ORDER_COMMENT_ATTACHMENT(buCode, poId),
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Failed to upload attachment");
  const json = await res.json();
  return json.data;
}
