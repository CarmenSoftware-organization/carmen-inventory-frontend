export interface UserProfile {
  id: string;
  email: string;
  alias_name: string;
  platform_role: string;
  user_info: {
    firstname: string;
    middlename: string;
    lastname: string;
    telephone: string;
  };
  business_unit: BusinessUnit[];
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  alias_name: string;
  is_default: boolean;
  system_level: string;
  is_active: boolean;
  department: {
    id: string;
    name: string;
  };
  hod_department: string[];
  config: BusinessUnitConfig;
}

export interface BusinessUnitConfig {
  calculation_method: string;
  default_currency_id: string;
  default_currency: {
    code: string;
    name: string;
    symbol: string;
    description: string;
    decimal_places: number;
  };
  hotel: ContactInfo;
  company: ContactInfo;
  tax_no: string;
  branch_no: string;
  date_format: string;
  time_format: string;
  date_time_format: string;
  long_time_format: string;
  short_time_format: string;
  timezone: string;
  perpage_format: { default: number };
  amount_format: NumberFormat;
  quantity_format: NumberFormat;
  recipe_format: NumberFormat;
  description: string;
  info: unknown;
  is_hq: boolean;
  is_active: boolean;
}

export interface ContactInfo {
  name: string;
  tel: string;
  email: string;
  address: string;
  zip_code: string;
}

interface NumberFormat {
  locales: string;
  minimumIntegerDigits: number;
}
