import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
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
  const { buCode } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUnitDto) => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await fetch(API_ENDPOINTS.UNITS(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create unit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}

export function useDeleteUnit() {
  const { buCode } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await fetch(`${API_ENDPOINTS.UNITS(buCode)}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete unit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}

export function useUpdateUnit() {
  const { buCode } = useProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: CreateUnitDto & { id: string }) => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await fetch(`${API_ENDPOINTS.UNITS(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update unit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
}
