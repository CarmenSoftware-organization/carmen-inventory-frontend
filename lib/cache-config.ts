/** Rarely changes: permissions, config, units */
export const CACHE_STATIC = {
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
} as const;

/** Moderate: vendor list, product catalog */
export const CACHE_NORMAL = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
} as const;

/** Frequently changes: PRs, POs, approvals */
export const CACHE_DYNAMIC = {
  staleTime: 1 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
} as const;

/** User profile — never stale unless explicitly refetched */
export const CACHE_PROFILE = {
  staleTime: Infinity,
} as const;
