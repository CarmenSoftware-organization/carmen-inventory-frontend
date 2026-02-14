export const API_ENDPOINTS = {
  PROFILE: "/api/proxy/api/user/profile",
  UNITS: (buCode: string) => `/api/proxy/api/config/${buCode}/units`,
  DEPARTMENTS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/departments`,
  LOCATIONS: (buCode: string) => `/api/proxy/api/config/${buCode}/locations`,
  DELIVERY_POINTS: (buCode: string) =>
    `/api/proxy/api/config/${buCode}/delivery-point`,
  LOGOUT: "/api/auth/logout",
  SWITCH_BU: "/api/proxy/api/business-unit/default",
} as const;
