import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { Department } from "@/types/department";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface DepartmentResponse {
  data: Department[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useDepartment(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<DepartmentResponse>({
    queryKey: ["departments", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.DEPARTMENTS(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch departments");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useDepartmentById(id: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<Department>({
    queryKey: ["departments", buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await fetch(`${API_ENDPOINTS.DEPARTMENTS(buCode)}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch department");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export function useCreateDepartment() {
  return useApiMutation<CreateDepartmentDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.DEPARTMENTS(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["departments"],
    errorMessage: "Failed to create department",
  });
}

export function useDeleteDepartment() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.DEPARTMENTS(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["departments"],
    errorMessage: "Failed to delete department",
  });
}

export function useUpdateDepartment() {
  return useApiMutation<CreateDepartmentDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.DEPARTMENTS(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["departments"],
    errorMessage: "Failed to update department",
  });
}
