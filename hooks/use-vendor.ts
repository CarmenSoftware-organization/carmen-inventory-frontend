import { createConfigCrud } from "@/hooks/use-config-crud";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type {
  VendorDetail,
  VendorInfoItem,
  VendorAddress,
  VendorContact,
} from "@/types/vendor";

export interface CreateVendorDto {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  business_type: { id: string }[];
  info: VendorInfoItem[];
  vendor_address: {
    add?: Omit<VendorAddress, "id">[];
  };
  vendor_contact: {
    add?: Omit<VendorContact, "id">[];
  };
}

const crud = createConfigCrud<VendorDetail, CreateVendorDto>({
  queryKey: QUERY_KEYS.VENDORS,
  endpoint: API_ENDPOINTS.VENDORS,
  label: "vendor",
});

export const useVendor = crud.useList;
export const useVendorById = crud.useById;
export const useCreateVendor = crud.useCreate;
export const useUpdateVendor = crud.useUpdate;
export const useDeleteVendor = crud.useDelete;
