import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PurchaseOrder } from "@/types/purchase-order";
import type { ParamsDto } from "@/types/params";

interface PaginatedResponse {
  data: PurchaseOrder[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export interface PoDetailPayload {
  sequence: number;
  product_id: string;
  product_name: string;
  product_local_name: string;
  order_unit_id: string;
  order_unit_name: string;
  order_unit_conversion_factor: number;
  order_qty: number;
  base_unit_id: string;
  base_unit_name: string;
  base_qty: number;
  price: number;
  sub_total_price: number;
  net_amount: number;
  total_price: number;
  tax_profile_id: string | null;
  tax_profile_name: string;
  tax_rate: number;
  tax_amount: number;
  is_tax_adjustment: boolean;
  discount_rate: number;
  discount_amount: number;
  is_discount_adjustment: boolean;
  is_foc: boolean;
  description: string;
  note: string;
}

export interface CreatePoDto {
  vendor_id: string;
  vendor_name: string;
  delivery_date: string;
  currency_id: string;
  currency_name: string;
  exchange_rate: number;
  description: string;
  order_date: string;
  credit_term_id: string;
  credit_term_name: string;
  credit_term_value: number;
  buyer_id: string;
  buyer_name: string;
  email: string;
  remarks: string;
  note: string;
  details: {
    add?: PoDetailPayload[];
    update?: (PoDetailPayload & { id: string })[];
    remove?: { id: string }[];
  };
}

export function usePurchaseOrder(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<PaginatedResponse>({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.PURCHASE_ORDER(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function usePurchaseOrderById(id: string | undefined) {
  const { buCode } = useProfile();

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
