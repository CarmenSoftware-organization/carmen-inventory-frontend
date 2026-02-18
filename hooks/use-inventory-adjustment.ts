import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type {
  InventoryAdjustment,
  InventoryAdjustmentType,
} from "@/types/inventory-adjustment";
import type { PaginatedResponse, ParamsDto } from "@/types/params";

interface CreateInventoryAdjustmentDto {
  description: string;
  doc_status: string;
  note: string;
  adjustment_type: string;
  details: {
    add: {
      product_id: string;
      product_name: string;
      product_local_name: string;
      location_id: string;
      location_code: string;
      location_name: string;
      qty: number;
      cost_per_unit: number;
      total_cost: number;
      description: string;
      note: string;
    }[];
  };
}

function getEndpoint(type: InventoryAdjustmentType) {
  return type === "stock-in" ? API_ENDPOINTS.STOCK_IN : API_ENDPOINTS.STOCK_OUT;
}

export function useInventoryAdjustment(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<PaginatedResponse<InventoryAdjustment>>({
    queryKey: [QUERY_KEYS.INVENTORY_ADJUSTMENTS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.INVENTORY_ADJUSTMENTS(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch inventory adjustments");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useInventoryAdjustmentById(
  id: string | undefined,
  type: InventoryAdjustmentType | undefined,
) {
  const { buCode } = useProfile();

  return useQuery<InventoryAdjustment>({
    queryKey: [QUERY_KEYS.INVENTORY_ADJUSTMENTS, buCode, type, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      if (!type) throw new Error("Missing type");
      const endpoint = getEndpoint(type);
      const res = await httpClient.get(`${endpoint(buCode)}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch inventory adjustment");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id && !!type,
  });
}

export function useCreateInventoryAdjustment() {
  return useApiMutation<
    CreateInventoryAdjustmentDto & { type: InventoryAdjustmentType }
  >({
    mutationFn: ({ type, ...data }, buCode) => {
      const endpoint = getEndpoint(type);
      return httpClient.post(endpoint(buCode), data);
    },
    invalidateKeys: [QUERY_KEYS.INVENTORY_ADJUSTMENTS],
    errorMessage: "Failed to create inventory adjustment",
  });
}

export function useUpdateInventoryAdjustment() {
  return useApiMutation<
    CreateInventoryAdjustmentDto & {
      id: string;
      type: InventoryAdjustmentType;
    }
  >({
    mutationFn: ({ id, type, ...data }, buCode) => {
      const endpoint = getEndpoint(type);
      return httpClient.put(`${endpoint(buCode)}/${id}`, data);
    },
    invalidateKeys: [QUERY_KEYS.INVENTORY_ADJUSTMENTS],
    errorMessage: "Failed to update inventory adjustment",
  });
}

export function useDeleteInventoryAdjustment() {
  return useApiMutation<{ id: string; type: InventoryAdjustmentType }>({
    mutationFn: ({ id, type }, buCode) => {
      const endpoint = getEndpoint(type);
      return httpClient.delete(`${endpoint(buCode)}/${id}`);
    },
    invalidateKeys: [QUERY_KEYS.INVENTORY_ADJUSTMENTS],
    errorMessage: "Failed to delete inventory adjustment",
  });
}
