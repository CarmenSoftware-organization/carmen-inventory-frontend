import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { Role, RoleDetail, CreateRoleDto, UpdateRoleDto } from "@/types/role";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getRoles(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<Role>> {
  const url = buildUrl(API_ENDPOINTS.APPLICATION_ROLES(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}

export async function getRoleById(
  buCode: string,
  id: string,
): Promise<RoleDetail> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.APPLICATION_ROLES(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch role");
  const json = await res.json();
  return json.data;
}

export async function createRole(
  buCode: string,
  data: CreateRoleDto,
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.APPLICATION_ROLES(buCode), data);
}

export async function updateRole(
  buCode: string,
  id: string,
  data: UpdateRoleDto,
): Promise<Response> {
  return httpClient.put(
    `${API_ENDPOINTS.APPLICATION_ROLES(buCode)}/${id}`,
    data,
  );
}

export async function deleteRole(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(
    `${API_ENDPOINTS.APPLICATION_ROLES(buCode)}/${id}`,
  );
}
