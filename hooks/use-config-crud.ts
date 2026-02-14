import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { ParamsDto } from "@/types/params";

interface PaginatedResponse<T> {
  data: T[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

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
}: ConfigCrudOptions) {
  function useList(params?: ParamsDto) {
    const { buCode } = useProfile();

    return useQuery<PaginatedResponse<T>>({
      queryKey: [queryKey, buCode, params],
      queryFn: async () => {
        if (!buCode) throw new Error("Missing buCode");
        const url = buildUrl(endpoint(buCode), params);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${label}s`);
        return res.json();
      },
      enabled: !!buCode,
    });
  }

  function useById(id: string | undefined) {
    const { buCode } = useProfile();

    return useQuery<T>({
      queryKey: [queryKey, buCode, id],
      queryFn: async () => {
        if (!buCode) throw new Error("Missing buCode");
        const res = await fetch(`${endpoint(buCode)}/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch ${label}`);
        const json = await res.json();
        return json.data;
      },
      enabled: !!buCode && !!id,
    });
  }

  function useCreate() {
    return useApiMutation<TCreate>({
      mutationFn: (data, buCode) =>
        fetch(endpoint(buCode), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to create ${label}`,
    });
  }

  function useUpdate() {
    return useApiMutation<TCreate & { id: string }>({
      mutationFn: ({ id, ...data }, buCode) =>
        fetch(`${endpoint(buCode)}/${id}`, {
          method: updateMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to update ${label}`,
    });
  }

  function useDelete() {
    return useApiMutation<string>({
      mutationFn: (id, buCode) =>
        fetch(`${endpoint(buCode)}/${id}`, {
          method: "DELETE",
        }),
      invalidateKeys: [queryKey],
      errorMessage: `Failed to delete ${label}`,
    });
  }

  return { useList, useById, useCreate, useUpdate, useDelete };
}
