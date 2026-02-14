import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { ExtraCost } from "@/types/extra-cost";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface ExtraCostResponse {
  data: ExtraCost[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useExtraCost(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<ExtraCostResponse>({
    queryKey: ["extra-costs", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.EXTRA_COST_TYPES(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch extra costs");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export interface CreateExtraCostDto {
  name: string;
  is_active: boolean;
}

export function useCreateExtraCost() {
  return useApiMutation<CreateExtraCostDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.EXTRA_COST_TYPES(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["extra-costs"],
    errorMessage: "Failed to create extra cost",
  });
}

export function useDeleteExtraCost() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.EXTRA_COST_TYPES(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["extra-costs"],
    errorMessage: "Failed to delete extra cost",
  });
}

export function useUpdateExtraCost() {
  return useApiMutation<CreateExtraCostDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.EXTRA_COST_TYPES(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["extra-costs"],
    errorMessage: "Failed to update extra cost",
  });
}
