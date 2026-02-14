import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { TaxProfile } from "@/types/tax-profile";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface TaxProfileResponse {
  data: TaxProfile[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useTaxProfile(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<TaxProfileResponse>({
    queryKey: ["tax-profiles", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.TAX_PROFILES(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tax profiles");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export interface CreateTaxProfileDto {
  name: string;
  tax_rate: number;
  is_active: boolean;
}

export function useCreateTaxProfile() {
  return useApiMutation<CreateTaxProfileDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.TAX_PROFILES(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["tax-profiles"],
    errorMessage: "Failed to create tax profile",
  });
}

export function useDeleteTaxProfile() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.TAX_PROFILES(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["tax-profiles"],
    errorMessage: "Failed to delete tax profile",
  });
}

export function useUpdateTaxProfile() {
  return useApiMutation<CreateTaxProfileDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.TAX_PROFILES(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["tax-profiles"],
    errorMessage: "Failed to update tax profile",
  });
}
