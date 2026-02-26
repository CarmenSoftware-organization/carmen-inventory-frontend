import {
  useQuery,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { ApiError } from "@/lib/api-error";
import { CACHE_STATIC } from "@/lib/cache-config";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

interface ConfigCrudOptions {
  queryKey: string;
  endpoint: (buCode: string) => string;
  label: string;
  updateMethod?: "PUT" | "PATCH";
}

export function createConfigCrud<T, TCreate>({
  queryKey,
  endpoint,
  label,
  updateMethod = "PUT",
}: ConfigCrudOptions): {
  useList: (params?: ParamsDto) => UseQueryResult<PaginatedResponse<T>>;
  useById: (id: string | undefined) => UseQueryResult<T>;
  useCreate: () => UseMutationResult<T, Error, TCreate>;
  useUpdate: () => UseMutationResult<T, Error, TCreate & { id: string }>;
  useDelete: () => UseMutationResult<unknown, Error, string>;
} {
  const methodMap = { PUT: "put", PATCH: "patch" } as const;
  const httpMethod = methodMap[updateMethod];

  function useList(params?: ParamsDto) {
    const buCode = useBuCode();

    return useQuery<PaginatedResponse<T>>({
      queryKey: [queryKey, buCode, params],
      queryFn: async () => {
        const url = buildUrl(endpoint(buCode!), params);
        const res = await httpClient.get(url);
        if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch data");
        return res.json();
      },
      enabled: !!buCode,
      ...CACHE_STATIC,
    });
  }

  function useById(id: string | undefined) {
    const buCode = useBuCode();

    return useQuery<T>({
      queryKey: [queryKey, buCode, id],
      queryFn: async () => {
        const res = await httpClient.get(`${endpoint(buCode!)}/${id!}`);
        if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch record");
        const json = await res.json();
        return json.data;
      },
      enabled: !!buCode && !!id,
      ...CACHE_STATIC,
    });
  }

  function useCreate() {
    return useApiMutation<TCreate, T>({
      mutationFn: (data, buCode) => httpClient.post(endpoint(buCode), data),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to create ${label}`,
    });
  }

  function useUpdate() {
    return useApiMutation<TCreate & { id: string }, T>({
      mutationFn: ({ id, ...data }, buCode) =>
        httpClient[httpMethod](`${endpoint(buCode)}/${id}`, data as TCreate),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to update ${label}`,
    });
  }

  function useDelete() {
    return useApiMutation<string>({
      mutationFn: (id, buCode) => httpClient.delete(`${endpoint(buCode)}/${id}`),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to delete ${label}`,
    });
  }

  return { useList, useById, useCreate, useUpdate, useDelete };
}
