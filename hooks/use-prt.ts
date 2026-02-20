import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PurchaseRequestTemplate } from "@/types/purchase-request";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_STATIC } from "@/lib/cache-config";

export interface PrtDetailPayload {
  location_id: string | null;
  delivery_point_id: string | null;
  product_id: string | null;
  product_name: string;
  inventory_unit_id: string | null;
  inventory_unit_name: string;
  requested_qty: number;
  requested_unit_id: string | null;
  requested_unit_name: string;
  requested_unit_conversion_factor: number;
  requested_base_qty: number;
  foc_qty: number;
  foc_unit_id: string | null;
  foc_unit_name: string;
  foc_unit_conversion_factor: number;
  foc_base_qty: number;
  currency_id: string | null;
  tax_profile_id: string | null;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  discount_rate: number;
  discount_amount: number;
  is_discount_adjustment: boolean;
  is_active: boolean;
}

export interface CreatePrtDto {
  name: string;
  description: string;
  workflow_id: string;
  department_id: string;
  is_active: boolean;
  note: string;
  purchase_request_template_detail: {
    add?: PrtDetailPayload[];
    update?: (PrtDetailPayload & { id: string })[];
    remove?: { id: string }[];
  };
}

export function usePrt(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<PurchaseRequestTemplate>>({
    queryKey: [QUERY_KEYS.PURCHASE_REQUEST_TEMPLATES, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(
        API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode),
        params,
      );
      const res = await httpClient.get(url);
      if (!res.ok)
        throw new Error("Failed to fetch purchase request templates");
      return res.json();
    },
    enabled: !!buCode,
    ...CACHE_STATIC,
  });
}

export function usePrtById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<PurchaseRequestTemplate>({
    queryKey: [QUERY_KEYS.PURCHASE_REQUEST_TEMPLATES, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch purchase request template");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreatePrt() {
  return useApiMutation<CreatePrtDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode), data),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUEST_TEMPLATES],
    errorMessage: "Failed to create purchase request template",
  });
}

export function useUpdatePrt() {
  return useApiMutation<CreatePrtDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(
        `${API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode)}/${id}`,
        data,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUEST_TEMPLATES],
    errorMessage: "Failed to update purchase request template",
  });
}

export function useDeletePrt() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(
        `${API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode)}/${id}`,
      ),
    invalidateKeys: [QUERY_KEYS.PURCHASE_REQUEST_TEMPLATES],
    errorMessage: "Failed to delete purchase request template",
  });
}
