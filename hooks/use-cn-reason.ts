import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { CnReason } from "@/types/cn-reason";

const crud = createConfigCrud<CnReason>({
  queryKey: QUERY_KEYS.CN_REASONS,
  endpoint: API_ENDPOINTS.CN_REASONS,
  label: "credit note reason",
});

export const useCnReason = crud.useList;
export const useCreateCnReason = crud.useCreate;
export const useUpdateCnReason = crud.useUpdate;
export const useDeleteCnReason = crud.useDelete;
