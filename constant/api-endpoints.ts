export const API_ENDPOINTS = {
  PROFILE: "/api/proxy/api/user/profile",
  UNITS: (buCode: string) => `/api/proxy/api/config/${buCode}/units`,
  DEPARTMENTS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/departments`,
  LOCATIONS: (buCode: string) => `/api/proxy/api/config/${buCode}/locations`,
  DELIVERY_POINTS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/delivery-point`,
  CURRENCIES: (buCode: string) => `/api/proxy/api/config/${buCode}/currencies`,
  TAX_PROFILES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/tax-profile`,
  EXTRA_COST_TYPES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/extra-cost-type`,
  VENDOR_BUSINESS_TYPES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/vendor-business-type`,
  ADJUSTMENT_TYPES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/adjustment-type`,
  PRODUCTS: (buCode: string) => `/api/proxy/api/config/${buCode}/products`,
  VENDORS: (buCode: string) => `/api/proxy/api/config/${buCode}/vendors`,
  PRICE_LISTS: (buCode: string) => `/api/proxy/api/config/${buCode}/price-list`,
  PRICE_LIST_TEMPLATES: (buCode: string) =>
    `/api/proxy/api/${buCode}/price-list-template`,
  LOGOUT: "/api/auth/logout",
  SWITCH_BU: "/api/proxy/api/business-unit/default",
} as const;
