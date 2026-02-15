import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type {
  PurchaseRequest,
  PurchaseRequestTemplate,
} from "@/types/purchase-request";
import type { ParamsDto } from "@/types/params";

interface PaginatedResponse {
  data: PurchaseRequest[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export interface CreatePurchaseRequestDto {
  state_role: string;
  details: {
    pr_date: string;
    description: string;
    requestor_id: string;
    workflow_id: string;
    department_id: string;
    purchase_request_detail: {
      add: {
        description: string;
        current_stage_status: string;
        product_id: string;
        requested_qty: number;
        unit_price: number;
        vendor_id: string;
        pricelist_detail_id: string | null;
      }[];
    };
  };
}

export function usePurchaseRequest(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<PaginatedResponse>({
    queryKey: [QUERY_KEYS.PURCHASE_REQUESTS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.PURCHASE_REQUESTS, {
        bu_code: buCode,
        ...params,
      });
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch purchase requests");
      const json = await res.json();
      const entry = json.data?.[0];
      return {
        data: entry?.data ?? [],
        paginate: entry?.paginate ?? {
          total: 0,
          page: 1,
          perpage: 10,
          pages: 0,
        },
      };
    },
    enabled: !!buCode,
  });
}

export function useMyPendingPurchaseRequest(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<PaginatedResponse>({
    queryKey: [QUERY_KEYS.MY_PENDING_PURCHASE_REQUESTS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.MY_PENDING_PURCHASE_REQUESTS, {
        bu_code: buCode,
        ...params,
      });
      const res = await httpClient.get(url);
      if (!res.ok)
        throw new Error("Failed to fetch my pending purchase requests");
      const json = await res.json();
      const entry = json.data?.[0];
      return {
        data: entry?.data ?? [],
        paginate: entry?.paginate ?? {
          total: 0,
          page: 1,
          perpage: 10,
          pages: 0,
        },
      };
    },
    enabled: !!buCode,
  });
}

export function usePurchaseRequestWorkflowStages() {
  const { buCode } = useProfile();

  return useQuery<string[]>({
    queryKey: [QUERY_KEYS.PURCHASE_REQUEST_WORKFLOW_STAGES, buCode],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.PURCHASE_REQUEST_WORKFLOW_STAGES, {
        bu_code: buCode,
      });
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch workflow stages");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode,
  });
}

export function usePurchaseRequestTemplates() {
  const { buCode } = useProfile();

  return useQuery<PurchaseRequestTemplate[]>({
    queryKey: [QUERY_KEYS.PURCHASE_REQUEST_TEMPLATES, buCode],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode),
      );
      if (!res.ok)
        throw new Error("Failed to fetch purchase request templates");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode,
  });
}

export function usePurchaseRequestById(id: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<PurchaseRequest>({
    queryKey: [QUERY_KEYS.PURCHASE_REQUESTS, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/purchase-request/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch purchase request");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreatePurchaseRequest() {
  return useApiMutation<CreatePurchaseRequestDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.PURCHASE_REQUEST(buCode), data),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUESTS],
    errorMessage: "Failed to create purchase request",
  });
}

export function useUpdatePurchaseRequest() {
  return useApiMutation<CreatePurchaseRequestDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.patch(`${API_ENDPOINTS.PURCHASE_REQUEST(buCode)}/${id}`, data),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUESTS],
    errorMessage: "Failed to update purchase request",
  });
}

export interface PurchaseRequestCommentAttachment {
  size: number;
  fileUrl: string;
  fileName: string;
  fileToken: string;
  contentType: string;
}

export interface PurchaseRequestComment {
  id: string;
  purchase_request_id: string;
  type: string;
  user_id: string;
  message: string;
  attachments: PurchaseRequestCommentAttachment[];
  created_at: string;
  created_by_id: string;
  updated_at: string;
  firstname: string;
  middlename: string | null;
  lastname: string;
}

export function usePurchaseRequestComments(prId: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<PurchaseRequestComment[]>({
    queryKey: [QUERY_KEYS.PURCHASE_REQUEST_COMMENTS, buCode, prId],
    queryFn: async () => {
      if (!buCode || !prId) throw new Error("Missing buCode or prId");
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/purchase-request/${prId}/comment`,
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!prId,
  });
}

export interface CreatePurchaseRequestCommentDto {
  purchase_request_id: string;
  message: string;
  type: string;
  attachments: PurchaseRequestCommentAttachment[];
}

export function useCreatePurchaseRequestComment() {
  return useApiMutation<CreatePurchaseRequestCommentDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(
        `/api/proxy/api/${buCode}/purchase-request-comment`,
        data,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUEST_COMMENTS],
    errorMessage: "Failed to add comment",
  });
}

export function useUpdatePurchaseRequestComment() {
  return useApiMutation<{
    id: string;
    message: string;
    attachments: PurchaseRequestCommentAttachment[];
  }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.patch(
        `/api/proxy/api/${buCode}/purchase-request-comment/${id}`,
        data,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUEST_COMMENTS],
    errorMessage: "Failed to update comment",
  });
}

export function useDeletePurchaseRequestComment() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(
        `/api/proxy/api/${buCode}/purchase-request-comment/${id}`,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUEST_COMMENTS],
    errorMessage: "Failed to delete comment",
  });
}

export async function uploadCommentAttachment(
  buCode: string,
  prId: string,
  file: File,
): Promise<PurchaseRequestCommentAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `/api/proxy/api/${buCode}/purchase-request-comment/${prId}/attachment`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Failed to upload attachment");
  const json = await res.json();
  return json.data;
}

export function useDeletePurchaseRequest() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.PURCHASE_REQUEST(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUESTS],
    errorMessage: "Failed to delete purchase request",
  });
}
