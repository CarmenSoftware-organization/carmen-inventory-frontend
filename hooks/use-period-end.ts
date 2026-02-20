import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PeriodEnd, CreatePeriodEndDto } from "@/types/period-end";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import * as api from "@/lib/api/period-ends";

export function usePeriodEnd(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<PeriodEnd>>({
    queryKey: [QUERY_KEYS.PERIOD_ENDS, buCode, params],
    queryFn: () => api.getPeriodEnds(buCode!, params),
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function usePeriodEndById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<PeriodEnd>({
    queryKey: [QUERY_KEYS.PERIOD_ENDS, buCode, id],
    queryFn: () => api.getPeriodEndById(buCode!, id!),
    enabled: !!buCode && !!id,
  });
}

export function useCreatePeriodEnd() {
  return useApiMutation<CreatePeriodEndDto>({
    mutationFn: (data, buCode) => api.createPeriodEnd(buCode, data),
    invalidateKeys: [QUERY_KEYS.PERIOD_ENDS],
    errorMessage: "Failed to create period end",
  });
}

export function useUpdatePeriodEnd() {
  return useApiMutation<CreatePeriodEndDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      api.updatePeriodEnd(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.PERIOD_ENDS],
    errorMessage: "Failed to update period end",
  });
}

export function useDeletePeriodEnd() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.deletePeriodEnd(buCode, id),
    invalidateKeys: [QUERY_KEYS.PERIOD_ENDS],
    errorMessage: "Failed to delete period end",
  });
}
