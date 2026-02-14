export const API_ENDPOINTS = {
  PROFILE: "/api/proxy/api/user/profile",
  UNITS: (buCode: string) => `/api/proxy/api/config/${buCode}/units`,
  LOGOUT: "/api/auth/logout",
} as const;
