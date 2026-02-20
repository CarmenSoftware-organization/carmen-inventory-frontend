import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { SpotCheck, CreateSpotCheckDto } from "@/types/spot-check";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export function useSpotCheck(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<SpotCheck>>({
    queryKey: [QUERY_KEYS.SPOT_CHECKS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.SPOT_CHECK(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch spot checks");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useSpotCheckById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<SpotCheck>({
    queryKey: [QUERY_KEYS.SPOT_CHECKS, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.SPOT_CHECK(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch spot check");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreateSpotCheck() {
  return useApiMutation<CreateSpotCheckDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.SPOT_CHECK(buCode), data),
    invalidateKeys: [QUERY_KEYS.SPOT_CHECKS],
    errorMessage: "Failed to create spot check",
  });
}

export function useUpdateSpotCheck() {
  return useApiMutation<CreateSpotCheckDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(`${API_ENDPOINTS.SPOT_CHECK(buCode)}/${id}`, data),
    invalidateKeys: [QUERY_KEYS.SPOT_CHECKS],
    errorMessage: "Failed to update spot check",
  });
}

export function useDeleteSpotCheck() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.SPOT_CHECK(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.SPOT_CHECKS],
    errorMessage: "Failed to delete spot check",
  });
}
