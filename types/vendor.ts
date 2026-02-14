export interface VendorInfoItem {
  label: string;
  value: string;
  data_type: string;
}

export interface VendorAddress {
  id?: string;
  address_type: string;
  address_line1: string;
  address_line2: string;
  district: string;
  province: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface VendorContact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  is_primary: boolean;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  business_type: { id: string; name: string }[];
  created_at: string;
  updated_at: string;
}

export interface VendorDetail extends Vendor {
  description: string;
  info: VendorInfoItem[];
  vendor_address: VendorAddress[];
  vendor_contact: VendorContact[];
}
