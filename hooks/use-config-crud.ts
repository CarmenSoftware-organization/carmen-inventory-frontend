import {
  useQuery,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
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
  useCreate: () => UseMutationResult<unknown, Error, TCreate>;
  useUpdate: () => UseMutationResult<unknown, Error, TCreate & { id: string }>;
  useDelete: () => UseMutationResult<unknown, Error, string>;
} {
  function useList(params?: ParamsDto) {
    const { buCode } = useProfile();

    return useQuery<PaginatedResponse<T>>({
      queryKey: [queryKey, buCode, params],
      queryFn: async () => {
        if (!buCode) throw new Error("Missing buCode");
        const url = buildUrl(endpoint(buCode), params);
        const res = await httpClient.get(url);
        if (!res.ok) throw new Error(`Failed to fetch ${label}s`);
        return res.json();
      },
      enabled: !!buCode,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  function useById(id: string | undefined) {
    const { buCode } = useProfile();

    return useQuery<T>({
      queryKey: [queryKey, buCode, id],
      queryFn: async () => {
        if (!buCode) throw new Error("Missing buCode");
        const res = await httpClient.get(`${endpoint(buCode)}/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch ${label}`);
        const json = await res.json();
        return json.data;
      },
      enabled: !!buCode && !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  function useCreate() {
    return useApiMutation<TCreate>({
      mutationFn: (data, buCode) =>
        httpClient.post(endpoint(buCode), data),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to create ${label}`,
    });
  }

  const methodMap = { PUT: "put", PATCH: "patch" } as const;
  const httpMethod = methodMap[updateMethod];

  function useUpdate() {
    return useApiMutation<TCreate & { id: string }>({
      mutationFn: ({ id, ...data }, buCode) =>
        httpClient[httpMethod](`${endpoint(buCode)}/${id}`, data),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to update ${label}`,
    });
  }

  function useDelete() {
    return useApiMutation<string>({
      mutationFn: (id, buCode) =>
        httpClient.delete(`${endpoint(buCode)}/${id}`),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to delete ${label}`,
    });
  }

  return { useList, useById, useCreate, useUpdate, useDelete };
}
