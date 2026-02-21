import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { ExchangeRateItem, ExchangeRateDto } from "@/types/exchange-rate";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_NORMAL } from "@/lib/cache-config";
import * as api from "@/lib/api/exchange-rates";

export function useExchangeRateQuery(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<ExchangeRateItem>>({
    queryKey: [QUERY_KEYS.EXCHANGE_RATES, buCode, params],
    queryFn: () => api.getExchangeRates(buCode!, params),
    enabled: !!buCode,
    ...CACHE_NORMAL,
  });
}

export function useExchangeRateMutation() {
  return useApiMutation<ExchangeRateDto[]>({
    mutationFn: (data, buCode) => api.createExchangeRates(buCode, data),
    invalidateKeys: [QUERY_KEYS.EXCHANGE_RATES, QUERY_KEYS.CURRENCIES],
    errorMessage: "Failed to update exchange rates",
  });
}

export function useExchangeRateUpdate() {
  return useApiMutation<{ id: string; exchange_rate: number }>({
    mutationFn: ({ id, ...data }, buCode) =>
      api.updateExchangeRate(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.EXCHANGE_RATES, QUERY_KEYS.CURRENCIES],
    errorMessage: "Failed to update exchange rate",
  });
}

export function useExternalExchangeRates(baseCurrency: string) {
  return useQuery<Record<string, number>>({
    queryKey: ["exchangeRates", baseCurrency],
    queryFn: () => api.getExternalExchangeRates(baseCurrency),
    enabled: !!baseCurrency,
    ...CACHE_NORMAL,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
}
