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
  REQUEST_PRICE_LISTS: (buCode: string) =>
    `/api/proxy/api/${buCode}/request-for-pricing`,
  INVENTORY_ADJUSTMENTS: (buCode: string) =>
    `/api/proxy/api/${buCode}/inventory-adjustment`,
  STOCK_IN: (buCode: string) => `/api/proxy/api/${buCode}/stock-in`,
  STOCK_OUT: (buCode: string) => `/api/proxy/api/${buCode}/stock-out`,
  PERMISSIONS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/permissions`,
  APPLICATION_ROLES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/application-roles`,
  STORE_REQUISITIONS: "/api/proxy/api/store-requisition",
  STORE_REQUISITION: (buCode: string) =>
    `/api/proxy/api/${buCode}/store-requisition`,
  WORKFLOWS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/workflows`,
  PURCHASE_REQUESTS: "/api/proxy/api/purchase-request",
  PURCHASE_REQUEST: (buCode: string) =>
    `/api/proxy/api/${buCode}/purchase-request`,
  MY_PENDING_PURCHASE_REQUESTS: "/api/proxy/api/my-pending/purchase-request",
  PURCHASE_REQUEST_WORKFLOW_STAGES:
    "/api/proxy/api/purchase-request/workflow-stages",
  PURCHASE_REQUEST_TEMPLATES: (buCode: string) =>
    `/api/proxy/api/${buCode}/purchase-request-template`,
  LOGOUT: "/api/auth/logout",
  SWITCH_BU: "/api/proxy/api/business-unit/default",
} as const;
