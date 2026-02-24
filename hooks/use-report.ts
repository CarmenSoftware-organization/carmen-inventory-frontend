import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Report } from "@/types/report";

export interface CreateReportDto {
  name: string;
  is_active: boolean;
}

const crud = createConfigCrud<Report, CreateReportDto>({
  queryKey: QUERY_KEYS.REPORTS,
  endpoint: API_ENDPOINTS.REPORTS,
  label: "report",
});

export const useReport = crud.useList;
export const useReportById = crud.useById;
export const useCreateReport = crud.useCreate;
export const useUpdateReport = crud.useUpdate;
export const useDeleteReport = crud.useDelete;
