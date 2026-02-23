import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { Equipment } from "@/types/equipment";

export interface CreateEquipmentDto {
  code: string;
  name: string;
  description: string | null;
  category_id: string | null;
  brand: string | null;
  model: string | null;
  serial_no: string | null;
  capacity: string | null;
  power_rating: string | null;
  station: string | null;
  operation_instructions: string | null;
  safety_notes: string | null;
  cleaning_instructions: string | null;
  maintenance_schedule: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  note: string | null;
  is_active: boolean;
  is_poolable: boolean;
  available_qty: number;
  total_qty: number;
  usage_count: number;
  average_usage_time: number;
}

const crud = createConfigCrud<Equipment, CreateEquipmentDto>({
  queryKey: QUERY_KEYS.RECIPE_EQUIPMENT,
  endpoint: API_ENDPOINTS.RECIPE_EQUIPMENT,
  label: "equipment",
  updateMethod: "PATCH",
});

export const useEquipment = crud.useList;
export const useEquipmentById = crud.useById;
export const useCreateEquipment = crud.useCreate;
export const useUpdateEquipment = crud.useUpdate;
export const useDeleteEquipment = crud.useDelete;
