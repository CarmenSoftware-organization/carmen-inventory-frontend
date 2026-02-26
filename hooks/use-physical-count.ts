import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { PhysicalCount, CreatePhysicalCountDto } from "@/types/physical-count";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import { ApiError } from "@/lib/api-error";

export function usePhysicalCount(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<PhysicalCount>>({
    queryKey: [QUERY_KEYS.PHYSICAL_COUNTS, buCode, params],
    queryFn: async () => {
      const url = buildUrl(API_ENDPOINTS.PHYSICAL_COUNT(buCode!), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch physical counts");
      return res.json();
    },
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function usePhysicalCountById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<PhysicalCount>({
    queryKey: [QUERY_KEYS.PHYSICAL_COUNTS, buCode, id],
    queryFn: async () => {
      const res = await httpClient.get(
        `${API_ENDPOINTS.PHYSICAL_COUNT(buCode!)}/${id!}`,
      );
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch physical count");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreatePhysicalCount() {
  return useApiMutation<CreatePhysicalCountDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.PHYSICAL_COUNT(buCode), data),
    invalidateKeys: [QUERY_KEYS.PHYSICAL_COUNTS],
    errorMessage: "Failed to create physical count",
  });
}

export function useUpdatePhysicalCount() {
  return useApiMutation<CreatePhysicalCountDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(`${API_ENDPOINTS.PHYSICAL_COUNT(buCode)}/${id}`, data),
    invalidateKeys: [QUERY_KEYS.PHYSICAL_COUNTS],
    errorMessage: "Failed to update physical count",
  });
}

export function useDeletePhysicalCount() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.PHYSICAL_COUNT(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.PHYSICAL_COUNTS],
    errorMessage: "Failed to delete physical count",
  });
}
