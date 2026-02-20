import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PeriodEnd, CreatePeriodEndDto } from "@/types/period-end";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";

export function usePeriodEnd(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<PeriodEnd>>({
    queryKey: [QUERY_KEYS.PERIOD_ENDS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.PERIOD_END(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch period ends");
      return res.json();
    },
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function usePeriodEndById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<PeriodEnd>({
    queryKey: [QUERY_KEYS.PERIOD_ENDS, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.PERIOD_END(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch period end");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreatePeriodEnd() {
  return useApiMutation<CreatePeriodEndDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.PERIOD_END(buCode), data),
    invalidateKeys: [QUERY_KEYS.PERIOD_ENDS],
    errorMessage: "Failed to create period end",
  });
}

export function useUpdatePeriodEnd() {
  return useApiMutation<CreatePeriodEndDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(`${API_ENDPOINTS.PERIOD_END(buCode)}/${id}`, data),
    invalidateKeys: [QUERY_KEYS.PERIOD_ENDS],
    errorMessage: "Failed to update period end",
  });
}

export function useDeletePeriodEnd() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.PERIOD_END(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.PERIOD_ENDS],
    errorMessage: "Failed to delete period end",
  });
}
