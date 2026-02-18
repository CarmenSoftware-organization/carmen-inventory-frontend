import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Department } from "@/types/department";

interface TransferPayload {
  add: { id: string }[];
  remove: { id: string }[];
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  department_users: TransferPayload;
  hod_users: TransferPayload;
}

const crud = createConfigCrud<Department, CreateDepartmentDto>({
  queryKey: QUERY_KEYS.DEPARTMENTS,
  endpoint: API_ENDPOINTS.DEPARTMENTS,
  label: "department",
  updateMethod: "PATCH",
});

export const useDepartment = crud.useList;
export const useDepartmentById = crud.useById;
export const useCreateDepartment = crud.useCreate;
export const useUpdateDepartment = crud.useUpdate;
export const useDeleteDepartment = crud.useDelete;
