import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { DeliveryPoint } from "@/types/delivery-point";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface DeliveryPointResponse {
  data: DeliveryPoint[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useDeliveryPoint(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<DeliveryPointResponse>({
    queryKey: ["delivery-points", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.DELIVERY_POINTS(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch delivery points");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export interface CreateDeliveryPointDto {
  name: string;
  is_active: boolean;
}

export function useCreateDeliveryPoint() {
  return useApiMutation<CreateDeliveryPointDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.DELIVERY_POINTS(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["delivery-points"],
    errorMessage: "Failed to create delivery point",
  });
}

export function useDeleteDeliveryPoint() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.DELIVERY_POINTS(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["delivery-points"],
    errorMessage: "Failed to delete delivery point",
  });
}

export function useUpdateDeliveryPoint() {
  return useApiMutation<CreateDeliveryPointDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.DELIVERY_POINTS(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["delivery-points"],
    errorMessage: "Failed to update delivery point",
  });
}
