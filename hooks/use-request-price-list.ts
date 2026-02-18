import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { RequestPriceList } from "@/types/request-price-list";

export interface CreateRequestPriceListDto {
  name: string;
  status: string;
  pricelist_template_id?: string;
  start_date: string;
  end_date: string;
  custom_message?: string;
  email_template_id?: string;
  info?: string;
  dimension?: unknown;
  vendors: {
    add?: {
      vendor_id: string;
      vendor_name: string;
      vendor_code: string;
      contact_person: string;
      contact_phone: string;
      contact_email: string;
      sequence_no: number;
      dimension: string;
      id: string;
    }[];
    remove?: string[];
  };
}

const crud = createConfigCrud<RequestPriceList, CreateRequestPriceListDto>({
  queryKey: QUERY_KEYS.REQUEST_PRICE_LISTS,
  endpoint: API_ENDPOINTS.REQUEST_PRICE_LISTS,
  label: "request price list",
  updateMethod: "PATCH",
});

export const useRequestPriceList = crud.useList;
export const useRequestPriceListById = crud.useById;
export const useCreateRequestPriceList = crud.useCreate;
export const useUpdateRequestPriceList = crud.useUpdate;
export const useDeleteRequestPriceList = crud.useDelete;
