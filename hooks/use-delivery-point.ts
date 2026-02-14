import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { DeliveryPoint } from "@/types/delivery-point";

export interface CreateDeliveryPointDto {
  name: string;
  is_active: boolean;
}

const crud = createConfigCrud<DeliveryPoint, CreateDeliveryPointDto>({
  queryKey: QUERY_KEYS.DELIVERY_POINTS,
  endpoint: API_ENDPOINTS.DELIVERY_POINTS,
  label: "delivery point",
});

export const useDeliveryPoint = crud.useList;
export const useCreateDeliveryPoint = crud.useCreate;
export const useUpdateDeliveryPoint = crud.useUpdate;
export const useDeleteDeliveryPoint = crud.useDelete;
