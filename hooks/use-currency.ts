import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { Currency } from "@/types/currency";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface CurrencyResponse {
  data: Currency[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useCurrency(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<CurrencyResponse>({
    queryKey: ["currencies", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.CURRENCIES(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch currencies");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  description: string;
  is_active: boolean;
}

export function useCreateCurrency() {
  return useApiMutation<CreateCurrencyDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.CURRENCIES(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["currencies"],
    errorMessage: "Failed to create currency",
  });
}

export function useDeleteCurrency() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.CURRENCIES(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["currencies"],
    errorMessage: "Failed to delete currency",
  });
}

export function useUpdateCurrency() {
  return useApiMutation<CreateCurrencyDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.CURRENCIES(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["currencies"],
    errorMessage: "Failed to update currency",
  });
}
