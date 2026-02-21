import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PhysicalCount, CreatePhysicalCountDto } from "@/types/physical-count";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import * as api from "@/lib/api/physical-counts";

export function usePhysicalCount(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<PhysicalCount>>({
    queryKey: [QUERY_KEYS.PHYSICAL_COUNTS, buCode, params],
    queryFn: () => api.getPhysicalCounts(buCode!, params),
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function usePhysicalCountById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<PhysicalCount>({
    queryKey: [QUERY_KEYS.PHYSICAL_COUNTS, buCode, id],
    queryFn: () => api.getPhysicalCountById(buCode!, id!),
    enabled: !!buCode && !!id,
  });
}

export function useCreatePhysicalCount() {
  return useApiMutation<CreatePhysicalCountDto>({
    mutationFn: (data, buCode) => api.createPhysicalCount(buCode, data),
    invalidateKeys: [QUERY_KEYS.PHYSICAL_COUNTS],
    errorMessage: "Failed to create physical count",
  });
}

export function useUpdatePhysicalCount() {
  return useApiMutation<CreatePhysicalCountDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      api.updatePhysicalCount(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.PHYSICAL_COUNTS],
    errorMessage: "Failed to update physical count",
  });
}

export function useDeletePhysicalCount() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.deletePhysicalCount(buCode, id),
    invalidateKeys: [QUERY_KEYS.PHYSICAL_COUNTS],
    errorMessage: "Failed to delete physical count",
  });
}
