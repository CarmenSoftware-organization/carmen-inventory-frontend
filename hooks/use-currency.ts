import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Currency } from "@/types/currency";

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  description: string;
  is_active: boolean;
}

const crud = createConfigCrud<Currency, CreateCurrencyDto>({
  queryKey: QUERY_KEYS.CURRENCIES,
  endpoint: API_ENDPOINTS.CURRENCIES,
  label: "currency",
});

export const useCurrency = crud.useList;
export const useCreateCurrency = crud.useCreate;
export const useUpdateCurrency = crud.useUpdate;
export const useDeleteCurrency = crud.useDelete;
