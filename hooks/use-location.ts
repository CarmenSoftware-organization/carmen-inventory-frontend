import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { Location } from "@/types/location";

export interface CreateLocationDto {
  code: string;
  name: string;
  location_type: string;
  physical_count_type: string;
  description: string;
  is_active: boolean;
}

const crud = createConfigCrud<Location, CreateLocationDto>({
  queryKey: "locations",
  endpoint: API_ENDPOINTS.LOCATIONS,
  label: "location",
});

export const useLocation = crud.useList;
export const useLocationById = crud.useById;
export const useCreateLocation = crud.useCreate;
export const useUpdateLocation = crud.useUpdate;
export const useDeleteLocation = crud.useDelete;
