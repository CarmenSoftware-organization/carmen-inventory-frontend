import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PriceList, PriceListStatus } from "@/types/price-list";

export interface CreatePriceListDto {
  vendor_id: string;
  name: string;
  description: string;
  status: PriceListStatus;
  currency_id: string;
  effective_from_date: string;
  effective_to_date: string;
  note: string;
  pricelist_detail: {
    add?: {
      sequence_no: number;
      product_id: string;
      price: number;
      price_without_tax: number;
      unit_id: string;
      tax_profile_id: string;
      tax_rate: number;
      tax_amt: number;
      lead_time_days: number;
      moq_qty: number;
    }[];
  };
}

const crud = createConfigCrud<PriceList, CreatePriceListDto>({
  queryKey: QUERY_KEYS.PRICE_LISTS,
  endpoint: API_ENDPOINTS.PRICE_LISTS,
  label: "price list",
});

export const usePriceList = crud.useList;
export const usePriceListById = crud.useById;
export const useCreatePriceList = crud.useCreate;
export const useUpdatePriceList = crud.useUpdate;
export const useDeletePriceList = crud.useDelete;
