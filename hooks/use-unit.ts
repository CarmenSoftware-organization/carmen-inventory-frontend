import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { Unit } from "@/types/unit";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface UnitResponse {
  data: Unit[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useUnit(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<UnitResponse>({
    queryKey: ["units", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.UNITS(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch units");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export interface CreateUnitDto {
  name: string;
  description: string;
  is_active: boolean;
}

export function useCreateUnit() {
  return useApiMutation<CreateUnitDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.UNITS(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["units"],
    errorMessage: "Failed to create unit",
  });
}

export function useDeleteUnit() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.UNITS(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["units"],
    errorMessage: "Failed to delete unit",
  });
}

export function useUpdateUnit() {
  return useApiMutation<CreateUnitDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.UNITS(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["units"],
    errorMessage: "Failed to update unit",
  });
}
