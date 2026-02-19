import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { ExchangeRateItem, ExchangeRateDto } from "@/types/exchange-rate";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export function useExchangeRateQuery(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<PaginatedResponse<ExchangeRateItem>>({
    queryKey: [QUERY_KEYS.EXCHANGE_RATES, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.EXCHANGE_RATES(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch exchange rates");
      return res.json();
    },
    enabled: !!buCode,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExchangeRateMutation() {
  return useApiMutation<ExchangeRateDto[]>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.EXCHANGE_RATES(buCode), data),
    invalidateKeys: [QUERY_KEYS.EXCHANGE_RATES, QUERY_KEYS.CURRENCIES],
    errorMessage: "Failed to update exchange rates",
  });
}

export function useExchangeRateUpdate() {
  return useApiMutation<{ id: string; exchange_rate: number }>({
    mutationFn: ({ id, ...data }, buCode) => {
      if (!id) throw new Error("Missing record ID for update");
      return httpClient.patch(
        `${API_ENDPOINTS.EXCHANGE_RATES(buCode)}/${id}`,
        data,
      );
    },
    invalidateKeys: [QUERY_KEYS.EXCHANGE_RATES, QUERY_KEYS.CURRENCIES],
    errorMessage: "Failed to update exchange rate",
  });
}

interface ExternalRateResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
  time_last_update_utc: string;
}

export function useExternalExchangeRates(baseCurrency: string) {
  return useQuery<Record<string, number>>({
    queryKey: ["exchangeRates", baseCurrency],
    queryFn: async () => {
      const res = await fetch(
        `/api/exchange-rate?base=${encodeURIComponent(baseCurrency)}`,
      );
      if (!res.ok)
        throw new Error(`Failed to fetch exchange rates: ${res.status}`);
      const data: ExternalRateResponse = await res.json();
      if (data.result !== "success")
        throw new Error("Exchange rate API returned an error");
      return data.conversion_rates;
    },
    enabled: !!baseCurrency,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
}
