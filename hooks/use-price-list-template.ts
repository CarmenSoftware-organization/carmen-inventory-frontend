import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type {
  PriceListTemplate,
  PriceListTemplateStatus,
} from "@/types/price-list-template";

export interface CreatePriceListTemplateDto {
  name: string;
  description: string;
  status: PriceListTemplateStatus;
  valid_period: number | null;
  vendor_instruction: string;
  currency_id: string;
  products: {
    add?: {
      product_id: string;
      moq: {
        unit_id: string;
        unit_name: string;
        note: string;
        qty: number;
      }[];
    }[];
  };
}

const crud = createConfigCrud<PriceListTemplate, CreatePriceListTemplateDto>({
  queryKey: QUERY_KEYS.PRICE_LIST_TEMPLATES,
  endpoint: API_ENDPOINTS.PRICE_LIST_TEMPLATES,
  label: "price list template",
});

export const usePriceListTemplate = crud.useList;
export const usePriceListTemplateById = crud.useById;
export const useCreatePriceListTemplate = crud.useCreate;
export const useUpdatePriceListTemplate = crud.useUpdate;
export const useDeletePriceListTemplate = crud.useDelete;
