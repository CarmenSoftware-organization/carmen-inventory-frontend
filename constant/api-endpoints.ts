export const API_ENDPOINTS = {
  ADJUSTMENT_TYPES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/adjustment-type`,
  APPROVAL_PENDING: "/api/proxy/api/my-approve",
  APPROVAL_PENDING_SUMMARY: "/api/proxy/api/my-approve/pending",
  APPLICATION_ROLES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/application-roles`,
  CN_REASONS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/credit-note-reason`,
  CREDIT_NOTE: (buCode: string) => `/api/proxy/api/${buCode}/credit-note`,
  CREDIT_NOTE_COMMENT: (buCode: string) =>
    `/api/proxy/api/${buCode}/credit-note-comment`,
  CREDIT_NOTE_COMMENT_ATTACHMENT: (buCode: string, cnId: string) =>
    `/api/proxy/api/${buCode}/credit-note-comment/${cnId}/attachment`,
  CREDIT_TERMS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/credit-term`,
  CUISINES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/recipe-cuisine`,
  CURRENCIES: (buCode: string) => `/api/proxy/api/config/${buCode}/currencies`,
  RECIPE_CATEGORIES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/recipe-category`,
  RECIPES: (buCode: string) => `/api/proxy/api/config/${buCode}/recipe`,
  EXCHANGE_RATES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/exchange-rate`,
  DEPARTMENTS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/departments`,
  DELIVERY_POINTS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/delivery-point`,
  DOCUMENTS: (buCode: string) => `/api/proxy/api/${buCode}/documents`,
  EXTRA_COST_TYPES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/extra-cost-type`,
  GOODS_RECEIVE_NOTE: (buCode: string) =>
    `/api/proxy/api/${buCode}/good-received-note`,
  GOODS_RECEIVE_NOTE_COMMENT: (buCode: string) =>
    `/api/proxy/api/${buCode}/good-received-note-comment`,
  GOODS_RECEIVE_NOTE_COMMENT_ATTACHMENT: (buCode: string, grnId: string) =>
    `/api/proxy/api/${buCode}/good-received-note-comment/${grnId}/attachment`,
  INVENTORY_ADJUSTMENTS: (buCode: string) =>
    `/api/proxy/api/${buCode}/inventory-adjustment`,
  LOCATIONS: (buCode: string) => `/api/proxy/api/config/${buCode}/locations`,
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  MY_PENDING_PURCHASE_REQUESTS: "/api/proxy/api/my-pending/purchase-request",
  NOTIFICATIONS_MARK_ALL_READ: (userId: string) =>
    `/api/proxy/api/notifications/mark-all-read/${userId}`,
  PROFILE: "/api/proxy/api/user/profile",
  PRODUCTS: (buCode: string) => `/api/proxy/api/config/${buCode}/products`,
  PRODUCTS_BY_LOCATION: (buCode: string, locationId: string) =>
    `/api/proxy/api/${buCode}/products/locations/${locationId}`,
  PRODUCT_UNITS_FOR_ORDER: (buCode: string, productId: string) =>
    `/api/proxy/api/${buCode}/unit/order/product/${productId}`,
  PRODUCT_INVENTORY: (buCode: string, locationId: string, productId: string) =>
    `/api/proxy/api/${buCode}/locations/${locationId}/product/${productId}/inventory`,
  PRODUCT_CATEGORIES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/products/category`,
  PRODUCT_SUB_CATEGORIES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/products/sub-category`,
  PRODUCT_ITEM_GROUPS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/products/item-group`,
  PRICE_LISTS: (buCode: string) => `/api/proxy/api/config/${buCode}/price-list`,
  PRICE_LIST_TEMPLATES: (buCode: string) =>
    `/api/proxy/api/${buCode}/price-list-template`,
  PURCHASE_REQUESTS: "/api/proxy/api/purchase-request",
  PURCHASE_REQUEST: (buCode: string) =>
    `/api/proxy/api/${buCode}/purchase-request`,
  PURCHASE_REQUEST_COMMENT: (buCode: string) =>
    `/api/proxy/api/${buCode}/purchase-request-comment`,
  PURCHASE_REQUEST_COMMENT_ATTACHMENT: (buCode: string, prId: string) =>
    `/api/proxy/api/${buCode}/purchase-request-comment/${prId}/attachment`,
  PURCHASE_REQUEST_WORKFLOW_STAGES: (buCode: string) =>
    `/api/proxy/api/${buCode}/purchase-request/workflow-stages`,
  PURCHASE_REQUEST_TEMPLATES: (buCode: string) =>
    `/api/proxy/api/${buCode}/purchase-request-template`,
  PURCHASE_ORDER: (buCode: string) => `/api/proxy/api/${buCode}/purchase-order`,
  PURCHASE_ORDER_COMMENT: (buCode: string) =>
    `/api/proxy/api/${buCode}/purchase-order-comment`,
  PURCHASE_ORDER_COMMENT_ATTACHMENT: (buCode: string, poId: string) =>
    `/api/proxy/api/${buCode}/purchase-order-comment/${poId}/attachment`,
  PERMISSIONS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/permissions`,
  PHYSICAL_COUNT: (buCode: string) => `/api/proxy/api/${buCode}/physical-count`,
  PERIOD_END: (buCode: string) => `/api/proxy/api/${buCode}/period-end`,
  REQUEST_PRICE_LISTS: (buCode: string) =>
    `/api/proxy/api/${buCode}/request-for-pricing`,
  STOCK_IN: (buCode: string) => `/api/proxy/api/${buCode}/stock-in`,
  STOCK_OUT: (buCode: string) => `/api/proxy/api/${buCode}/stock-out`,
  STORE_REQUISITIONS: "/api/proxy/api/store-requisition",
  STORE_REQUISITION: (buCode: string) =>
    `/api/proxy/api/${buCode}/store-requisition`,
  SPOT_CHECK: (buCode: string) => `/api/proxy/api/${buCode}/spot-check`,
  SWITCH_BU: "/api/proxy/api/business-unit/default",
  TAX_PROFILES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/tax-profile`,
  VENDORS: (buCode: string) => `/api/proxy/api/config/${buCode}/vendors`,
  UNITS: (buCode: string) => `/api/proxy/api/config/${buCode}/units`,
  USERS: (buCode: string) => `/api/proxy/api/${buCode}/users`,
  USER_APPLICATION_ROLES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/user-application-roles`,
  VENDOR_BUSINESS_TYPES: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/vendor-business-type`,
  WORKFLOW_BY_TYPE: (buCode: string, type: string) =>
    `/api/proxy/api/${buCode}/workflow/type/${type}`,
  WORKFLOWS: (buCode: string) => `/api/proxy/api/config/${buCode}/workflows`,
  // External (no auth)
  PRICE_LIST_EXTERNAL_CHECK: (urlToken: string) =>
    `/api/external/api/check-price-list/${urlToken}`,
  PRICE_LIST_EXTERNAL: (urlToken: string) =>
    `/api/external/api/price-list-external/${urlToken}`,
} as const;
