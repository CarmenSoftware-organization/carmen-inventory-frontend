import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type {
  Role,
  RoleDetail,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/types/role";
import type { ParamsDto } from "@/types/params";

interface RoleListResponse {
  data: Role[];
}

export function useRole(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<RoleListResponse>({
    queryKey: [QUERY_KEYS.APPLICATION_ROLES, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.APPLICATION_ROLES(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useRoleById(id: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<RoleDetail>({
    queryKey: [QUERY_KEYS.APPLICATION_ROLES, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.APPLICATION_ROLES(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch role");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreateRole() {
  return useApiMutation<CreateRoleDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.APPLICATION_ROLES(buCode), data),
    invalidateKeys: [QUERY_KEYS.APPLICATION_ROLES],
    errorMessage: "Failed to create role",
  });
}

export function useUpdateRole() {
  return useApiMutation<UpdateRoleDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(
        `${API_ENDPOINTS.APPLICATION_ROLES(buCode)}/${id}`,
        data,
      ),
    invalidateKeys: [QUERY_KEYS.APPLICATION_ROLES],
    errorMessage: "Failed to update role",
  });
}

export function useDeleteRole() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.APPLICATION_ROLES(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.APPLICATION_ROLES],
    errorMessage: "Failed to delete role",
  });
}
