import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { TaxProfile } from "@/types/tax-profile";

export interface CreateTaxProfileDto {
  name: string;
  tax_rate: number;
  is_active: boolean;
}

const crud = createConfigCrud<TaxProfile, CreateTaxProfileDto>({
  queryKey: "tax-profiles",
  endpoint: API_ENDPOINTS.TAX_PROFILES,
  label: "tax profile",
});

export const useTaxProfile = crud.useList;
export const useCreateTaxProfile = crud.useCreate;
export const useUpdateTaxProfile = crud.useUpdate;
export const useDeleteTaxProfile = crud.useDelete;
