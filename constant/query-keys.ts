export const QUERY_KEYS = {
  PROFILE: "profile",
  BUSINESS_TYPES: "business-types",
  EXTRA_COSTS: "extra-costs",
  UNITS: "units",
  DELIVERY_POINTS: "delivery-points",
  DEPARTMENTS: "departments",
  LOCATIONS: "locations",
  ADJUSTMENT_TYPES: "adjustment-types",
  TAX_PROFILES: "tax-profiles",
  CURRENCIES: "currencies",
  PRODUCTS: "products",
  VENDORS: "vendors",
  PRICE_LISTS: "price-lists",
  PRICE_LIST_TEMPLATES: "price-list-templates",
  REQUEST_PRICE_LISTS: "request-price-lists",
  STORE_REQUISITIONS: "store-requisitions",
  INVENTORY_ADJUSTMENTS: "inventory-adjustments",
} as const;

export type QueryKey = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];
