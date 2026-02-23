import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { StoreRequisition } from "@/types/store-requisition";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";

export interface SrDetailPayload {
  product_id: string;
  description: string;
  requested_qty: number;
  approved_qty: number;
  issued_qty: number;
  current_stage_status: string;
}

export interface CreateStoreRequisitionDto {
  stage_role: string;
  details: {
    sr_date: string;
    expected_date: string;
    description: string;
    requestor_id: string;
    workflow_id: string;
    department_id: string;
    from_location_id: string;
    to_location_id: string;
    doc_version: number;
    store_requisition_detail: {
      add?: SrDetailPayload[];
      update?: (SrDetailPayload & { id: string })[];
      remove?: { id: string }[];
    };
  };
}

export function useStoreRequisition(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<StoreRequisition>>({
    queryKey: [QUERY_KEYS.STORE_REQUISITIONS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.STORE_REQUISITIONS, {
        bu_code: buCode,
        ...params,
      });
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch store requisitions");
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
    ...CACHE_DYNAMIC,
  });
}

export function useStoreRequisitionById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<StoreRequisition>({
    queryKey: [QUERY_KEYS.STORE_REQUISITIONS, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.STORE_REQUISITION(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch store requisition");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreateStoreRequisition() {
  return useApiMutation<CreateStoreRequisitionDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.STORE_REQUISITION(buCode), data),
    invalidateKeys: [QUERY_KEYS.STORE_REQUISITIONS],
    errorMessage: "Failed to create store requisition",
  });
}

export function useUpdateStoreRequisition() {
  return useApiMutation<CreateStoreRequisitionDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(`${API_ENDPOINTS.STORE_REQUISITION(buCode)}/${id}`, data),
    invalidateKeys: [QUERY_KEYS.STORE_REQUISITIONS],
    errorMessage: "Failed to update store requisition",
  });
}

export function useDeleteStoreRequisition() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.STORE_REQUISITION(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.STORE_REQUISITIONS],
    errorMessage: "Failed to delete store requisition",
  });
}
