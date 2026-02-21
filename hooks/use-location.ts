import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Location, PhysicalCountType } from "@/types/location";
import type { INVENTORY_TYPE } from "@/constant/location";

interface TransferPayload {
  add: { id: string }[];
  remove: { id: string }[];
}

export interface CreateLocationDto {
  code: string;
  name: string;
  location_type: INVENTORY_TYPE;
  physical_count_type: PhysicalCountType;
  description: string;
  is_active: boolean;
  users: TransferPayload;
  products: TransferPayload;
}

const crud = createConfigCrud<Location, CreateLocationDto>({
  queryKey: QUERY_KEYS.LOCATIONS,
  endpoint: API_ENDPOINTS.LOCATIONS,
  label: "location",
  updateMethod: "PATCH",
});

export const useLocation = crud.useList;
export const useLocationById = crud.useById;
export const useCreateLocation = crud.useCreate;
export const useUpdateLocation = crud.useUpdate;
export const useDeleteLocation = crud.useDelete;
