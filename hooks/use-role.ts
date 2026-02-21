import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import type {
  Role,
  RoleDetail,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/types/role";
import type { PaginatedResponse, ParamsDto } from "@/types/params";
import { CACHE_STATIC } from "@/lib/cache-config";
import * as api from "@/lib/api/roles";

export function useRole(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<Role>>({
    queryKey: [QUERY_KEYS.APPLICATION_ROLES, buCode, params],
    queryFn: () => api.getRoles(buCode!, params),
    enabled: !!buCode,
    ...CACHE_STATIC,
  });
}

export function useRoleById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<RoleDetail>({
    queryKey: [QUERY_KEYS.APPLICATION_ROLES, buCode, id],
    queryFn: () => api.getRoleById(buCode!, id!),
    enabled: !!buCode && !!id,
  });
}

export function useCreateRole() {
  return useApiMutation<CreateRoleDto>({
    mutationFn: (data, buCode) => api.createRole(buCode, data),
    invalidateKeys: [QUERY_KEYS.APPLICATION_ROLES],
    errorMessage: "Failed to create role",
  });
}

export function useUpdateRole() {
  return useApiMutation<UpdateRoleDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) => api.updateRole(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.APPLICATION_ROLES],
    errorMessage: "Failed to update role",
  });
}

export function useDeleteRole() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.deleteRole(buCode, id),
    invalidateKeys: [QUERY_KEYS.APPLICATION_ROLES],
    errorMessage: "Failed to delete role",
  });
}
