export const QUERY_KEYS = {
  ADJUSTMENT_TYPES: "adjustment-types",
  APPROVAL_PENDING: "approval-pending",
  APPROVAL_PENDING_SUMMARY: "approval-pending-summary",
  APPLICATION_ROLES: "application-roles",
  BUSINESS_TYPES: "business-types",
  CN_REASONS: "cn-reasons",
  CREDIT_NOTES: "credit-notes",
  CREDIT_NOTE_COMMENTS: "credit-note-comments",
  CREDIT_TERMS: "credit-terms",
  CUISINES: "cuisines",
  CURRENCIES: "currencies",
  RECIPE_CATEGORIES: "recipe-categories",
  RECIPES: "recipes",
  DELIVERY_POINTS: "delivery-points",
  DEPARTMENTS: "departments",
  DOCUMENTS: "documents",
  EXCHANGE_RATES: "exchange-rates",
  EXTRA_COSTS: "extra-costs",
  GOODS_RECEIVE_NOTES: "goods-receive-notes",
  GOODS_RECEIVE_NOTE_COMMENTS: "goods-receive-note-comments",
  INVENTORY_ADJUSTMENTS: "inventory-adjustments",
  LOCATIONS: "locations",
  MY_PENDING_PURCHASE_REQUESTS: "my-pending-purchase-requests",
  PERIOD_ENDS: "period-ends",
  PERMISSIONS: "permissions",
  PHYSICAL_COUNTS: "physical-counts",
  PRICE_LISTS: "price-lists",
  PRICE_LIST_TEMPLATES: "price-list-templates",
  PRODUCTS: "products",
  PRODUCTS_BY_LOCATION: "products-by-location",
  PRODUCT_INVENTORY: "product-inventory",
  PRODUCT_UNITS: "product-units",
  PRODUCT_CATEGORIES: "product-categories",
  PRODUCT_ITEM_GROUPS: "product-item-groups",
  PRODUCT_SUB_CATEGORIES: "product-sub-categories",
  PROFILE: "profile",
  PURCHASE_ORDERS: "purchase-orders",
  PURCHASE_ORDER_COMMENTS: "purchase-order-comments",
  PURCHASE_REQUESTS: "purchase-requests",
  PURCHASE_REQUEST_COMMENTS: "purchase-request-comments",
  PURCHASE_REQUEST_TEMPLATES: "purchase-request-templates",
  PURCHASE_REQUEST_WORKFLOW_STAGES: "purchase-request-workflow-stages",
  REQUEST_PRICE_LISTS: "request-price-lists",
  SPOT_CHECKS: "spot-checks",
  STOCK_REPLENISHMENT: "stock-replenishment",
  STORE_REQUISITIONS: "store-requisitions",
  TAX_PROFILES: "tax-profiles",
  UNITS: "units",
  USERS: "users",
  VENDORS: "vendors",
  WASTAGE_REPORTS: "wastage-reports",
  WORKFLOWS: "workflows",
  // External
  PRICE_LIST_EXTERNAL: "price-list-external",
} as const;

export type QueryKey = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];

// Type-safe query key factories
import type { ParamsDto } from "@/types/params";

export const queryKeys = {
  purchaseRequests: {
    all: () => [QUERY_KEYS.PURCHASE_REQUESTS] as const,
    lists: () => [...queryKeys.purchaseRequests.all(), "list"] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.purchaseRequests.lists(), buCode, params] as const,
    details: () => [...queryKeys.purchaseRequests.all(), "detail"] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.purchaseRequests.details(), buCode, id] as const,
    comments: (buCode: string, prId: string) =>
      [QUERY_KEYS.PURCHASE_REQUEST_COMMENTS, buCode, prId] as const,
  },
  purchaseOrders: {
    all: () => [QUERY_KEYS.PURCHASE_ORDERS] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.purchaseOrders.all(), "list", buCode, params] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.purchaseOrders.all(), "detail", buCode, id] as const,
    comments: (buCode: string, poId: string) =>
      [QUERY_KEYS.PURCHASE_ORDER_COMMENTS, buCode, poId] as const,
  },
  vendors: {
    all: () => [QUERY_KEYS.VENDORS] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.vendors.all(), "list", buCode, params] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.vendors.all(), "detail", buCode, id] as const,
  },
  products: {
    all: () => [QUERY_KEYS.PRODUCTS] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.products.all(), "list", buCode, params] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.products.all(), "detail", buCode, id] as const,
  },
  goodsReceiveNotes: {
    all: () => [QUERY_KEYS.GOODS_RECEIVE_NOTES] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.goodsReceiveNotes.all(), "list", buCode, params] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.goodsReceiveNotes.all(), "detail", buCode, id] as const,
    comments: (buCode: string, grnId: string) =>
      [QUERY_KEYS.GOODS_RECEIVE_NOTE_COMMENTS, buCode, grnId] as const,
  },
  creditNotes: {
    all: () => [QUERY_KEYS.CREDIT_NOTES] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.creditNotes.all(), "list", buCode, params] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.creditNotes.all(), "detail", buCode, id] as const,
    comments: (buCode: string, cnId: string) =>
      [QUERY_KEYS.CREDIT_NOTE_COMMENTS, buCode, cnId] as const,
  },
  storeRequisitions: {
    all: () => [QUERY_KEYS.STORE_REQUISITIONS] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.storeRequisitions.all(), "list", buCode, params] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.storeRequisitions.all(), "detail", buCode, id] as const,
  },
} as const;
