import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { AdjustmentType } from "@/types/adjustment-type";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface AdjustmentTypeResponse {
  data: AdjustmentType[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useAdjustmentType(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<AdjustmentTypeResponse>({
    queryKey: ["adjustment-types", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.ADJUSTMENT_TYPES(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch adjustment types");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useAdjustmentTypeById(id: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<AdjustmentType>({
    queryKey: ["adjustment-types", buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await fetch(
        `${API_ENDPOINTS.ADJUSTMENT_TYPES(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch adjustment type");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export interface CreateAdjustmentTypeDto {
  code: string;
  name: string;
  type: string;
  description: string;
  note: string;
  is_active: boolean;
}

export function useCreateAdjustmentType() {
  return useApiMutation<CreateAdjustmentTypeDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.ADJUSTMENT_TYPES(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["adjustment-types"],
    errorMessage: "Failed to create adjustment type",
  });
}

export function useDeleteAdjustmentType() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.ADJUSTMENT_TYPES(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["adjustment-types"],
    errorMessage: "Failed to delete adjustment type",
  });
}

export function useUpdateAdjustmentType() {
  return useApiMutation<CreateAdjustmentTypeDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.ADJUSTMENT_TYPES(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["adjustment-types"],
    errorMessage: "Failed to update adjustment type",
  });
}
