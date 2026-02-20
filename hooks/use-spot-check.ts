import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { SpotCheck, CreateSpotCheckDto } from "@/types/spot-check";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import * as api from "@/lib/api/spot-checks";

export function useSpotCheck(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<SpotCheck>>({
    queryKey: [QUERY_KEYS.SPOT_CHECKS, buCode, params],
    queryFn: () => api.getSpotChecks(buCode!, params),
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function useSpotCheckById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<SpotCheck>({
    queryKey: [QUERY_KEYS.SPOT_CHECKS, buCode, id],
    queryFn: () => api.getSpotCheckById(buCode!, id!),
    enabled: !!buCode && !!id,
  });
}

export function useCreateSpotCheck() {
  return useApiMutation<CreateSpotCheckDto>({
    mutationFn: (data, buCode) => api.createSpotCheck(buCode, data),
    invalidateKeys: [QUERY_KEYS.SPOT_CHECKS],
    errorMessage: "Failed to create spot check",
  });
}

export function useUpdateSpotCheck() {
  return useApiMutation<CreateSpotCheckDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      api.updateSpotCheck(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.SPOT_CHECKS],
    errorMessage: "Failed to update spot check",
  });
}

export function useDeleteSpotCheck() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.deleteSpotCheck(buCode, id),
    invalidateKeys: [QUERY_KEYS.SPOT_CHECKS],
    errorMessage: "Failed to delete spot check",
  });
}
