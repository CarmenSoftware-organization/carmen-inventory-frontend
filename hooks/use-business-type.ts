import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { BusinessType } from "@/types/business-type";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface BusinessTypeResponse {
  data: BusinessType[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useBusinessType(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<BusinessTypeResponse>({
    queryKey: ["business-types", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(
        API_ENDPOINTS.VENDOR_BUSINESS_TYPES(buCode),
        params,
      );
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch business types");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export interface CreateBusinessTypeDto {
  name: string;
  is_active: boolean;
}

export function useCreateBusinessType() {
  return useApiMutation<CreateBusinessTypeDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.VENDOR_BUSINESS_TYPES(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["business-types"],
    errorMessage: "Failed to create business type",
  });
}

export function useDeleteBusinessType() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.VENDOR_BUSINESS_TYPES(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["business-types"],
    errorMessage: "Failed to delete business type",
  });
}

export function useUpdateBusinessType() {
  return useApiMutation<CreateBusinessTypeDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.VENDOR_BUSINESS_TYPES(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["business-types"],
    errorMessage: "Failed to update business type",
  });
}
