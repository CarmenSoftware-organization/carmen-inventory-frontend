import { useQuery } from "@tanstack/react-query";
import { createConfigCrud } from "@/hooks/use-config-crud";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useBuCode } from "@/hooks/use-bu-code";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import { httpClient } from "@/lib/http-client";
import { ApiError, ERROR_CODES } from "@/lib/api-error";
import type { User } from "@/types/workflows";
import type { UserDetail } from "@/types/user";

const crud = createConfigCrud<User, never>({
  queryKey: QUERY_KEYS.USERS,
  endpoint: API_ENDPOINTS.USERS,
  label: "user",
});

export const useUser = crud.useList;
export const useDeleteUser = crud.useDelete;

export function useUserById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<UserDetail>({
    queryKey: [QUERY_KEYS.USERS, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new ApiError(ERROR_CODES.MISSING_REQUIRED_FIELD, "Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.USER_APPLICATION_ROLES(buCode)}/${id}`,
      );
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch user");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export interface UpdateUserRolesDto {
  user_id: string;
  application_role_id: {
    add?: string[];
    remove?: string[];
  };
}

export function useUpdateUserRoles() {
  return useApiMutation<UpdateUserRolesDto>({
    mutationFn: (data, buCode) =>
      httpClient.patch(API_ENDPOINTS.USER_APPLICATION_ROLES(buCode), data),
    invalidateKeys: [QUERY_KEYS.USERS],
    errorMessage: "Failed to update user roles",
  });
}
