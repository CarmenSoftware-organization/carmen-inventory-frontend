import {
  useQuery,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { createConfigApi } from "@/lib/api/config-crud";
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
  const api = createConfigApi<T, TCreate>({ endpoint, label, updateMethod });

  function useList(params?: ParamsDto) {
    const buCode = useBuCode();

    return useQuery<PaginatedResponse<T>>({
      queryKey: [queryKey, buCode, params],
      queryFn: () => api.getList(buCode!, params),
      enabled: !!buCode,
      ...CACHE_STATIC,
    });
  }

  function useById(id: string | undefined) {
    const buCode = useBuCode();

    return useQuery<T>({
      queryKey: [queryKey, buCode, id],
      queryFn: () => api.getById(buCode!, id!),
      enabled: !!buCode && !!id,
      ...CACHE_STATIC,
    });
  }

  function useCreate() {
    return useApiMutation<TCreate, T>({
      mutationFn: (data, buCode) => api.create(buCode, data),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to create ${label}`,
    });
  }

  function useUpdate() {
    return useApiMutation<TCreate & { id: string }, T>({
      mutationFn: ({ id, ...data }, buCode) =>
        api.update(buCode, id, data as TCreate),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to update ${label}`,
    });
  }

  function useDelete() {
    return useApiMutation<string>({
      mutationFn: (id, buCode) => api.remove(buCode, id),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to delete ${label}`,
    });
  }

  return { useList, useById, useCreate, useUpdate, useDelete };
}
