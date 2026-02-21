# Engineering Improvement Plan

> Carmen Inventory Frontend — Silicon Valley Standards Audit
> Generated: 2026-02-20 | Baseline: Next.js 16.1.6, React 19, TypeScript 5

---

## Current Score

| Category | Score | Target |
|---|---|---|
| Security & Auth | 4/10 | 8/10 |
| State Management | 5/10 | 8/10 |
| Type Safety | 4/10 | 9/10 |
| Error Handling | 3.5/10 | 8/10 |
| Component Architecture | 5.5/10 | 8/10 |
| Performance | 6/10 | 8/10 |
| Accessibility (a11y) | 2/10 | 7/10 |
| Test Coverage | 3/10 | 7/10 |
| **Overall** | **4.1/10** | **8/10** |

---

## Phase 1: Security Hardening (Week 1)

### 1.1 Proxy Route — Timeout, Body Limit, Path Validation, Security Headers

**File:** `app/api/proxy/[...path]/route.ts`

**BEFORE:**
```typescript
const backendPath = params.path.join("/");
const url = new URL(`${BACKEND_URL}/${backendPath}`);

// ...

if (!["GET", "HEAD"].includes(request.method)) {
  init.body = await request.text();
}

let res = await fetch(url.toString(), init);

// ...

return new NextResponse(body, {
  status: res.status,
  headers: {
    "Content-Type": res.headers.get("Content-Type") || "application/json",
  },
});
```

**AFTER:**
```typescript
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
} as const;

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB
const FETCH_TIMEOUT_MS = 15_000; // 15s

async function proxyRequest(request: NextRequest, params: { path: string[] }) {
  // --- PATH VALIDATION ---
  const backendPath = params.path.join("/");
  if (backendPath.includes("..") || backendPath.includes("//")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // --- BODY SIZE LIMIT ---
  if (!["GET", "HEAD"].includes(request.method)) {
    const contentLength = parseInt(request.headers.get("content-length") || "0");
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    init.body = await request.text();
  }

  // --- FETCH WITH TIMEOUT ---
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let res = await fetch(url.toString(), { ...init, signal: controller.signal });
    clearTimeout(timeout);

    // Auto-refresh on 401 (existing logic)
    if (res.status === 401) {
      const newToken = await refreshAccessToken(cookieStore);
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(url.toString(), { ...init, headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      } else {
        return NextResponse.json({ error: "Session expired" }, { status: 401 });
      }
    }

    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json({ error: "Backend timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal proxy error" }, { status: 502 });
  }
}
```

**Cross-check:**
- [ ] Path traversal: `../../etc/passwd` returns 400
- [ ] Body > 1MB: returns 413
- [ ] Backend hangs > 15s: returns 504
- [ ] Response has `X-Content-Type-Options: nosniff`
- [ ] 401 auto-refresh still works with timeout

---

### 1.2 Cookie Security — Always Secure, Fix Refresh Token Path

**File:** `lib/cookies.ts`

**BEFORE:**
```typescript
export const ACCESS_TOKEN_COOKIE: ResponseCookie = {
  name: "access_token",
  httpOnly: true,
  secure: isProduction,       // false in dev!
  sameSite: "strict",
  path: "/",
  maxAge: 900,
};

export const REFRESH_TOKEN_COOKIE: ResponseCookie = {
  name: "refresh_token",
  httpOnly: true,
  secure: isProduction,       // false in dev!
  sameSite: "strict",
  path: "/api/auth/refresh",  // too restrictive — proxy can't access it
  maxAge: 604800,
};
```

**AFTER:**
```typescript
export const ACCESS_TOKEN_COOKIE: ResponseCookie = {
  name: "access_token",
  value: "",
  httpOnly: true,
  secure: true,               // always true — use HTTPS in dev too
  sameSite: "strict",
  path: "/",
  maxAge: 900,
};

export const REFRESH_TOKEN_COOKIE: ResponseCookie = {
  name: "refresh_token",
  value: "",
  httpOnly: true,
  secure: true,               // always true
  sameSite: "strict",
  path: "/",                  // available to proxy route for auto-refresh
  maxAge: 604800,
};
```

**Cross-check:**
- [ ] Dev environment uses HTTPS (self-signed cert or `next dev --experimental-https`)
- [ ] Proxy route can read `refresh_token` cookie
- [ ] Auto-refresh works correctly after path change
- [ ] Login flow sets both cookies correctly

---

### 1.3 Logout — Invalidate Token on Backend

**File:** `app/api/auth/logout/route.ts`

**BEFORE:**
```typescript
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  return NextResponse.json({ success: true });
}
```

**AFTER:**
```typescript
const BACKEND_URL = process.env.BACKEND_URL;
const X_APP_ID = process.env.X_APP_ID!;

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Invalidate token on backend (best-effort, don't block logout)
  if (accessToken && BACKEND_URL) {
    fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-app-id": X_APP_ID,
      },
    }).catch(() => {}); // fire-and-forget
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  return NextResponse.json({ success: true });
}
```

**Cross-check:**
- [ ] Backend endpoint `/api/auth/logout` exists (confirm with backend team)
- [ ] Logout still works if backend is unreachable (fire-and-forget)
- [ ] Cookies are deleted regardless of backend response

---

### 1.4 Proxy Path Matching — Fix `startsWith` Overmatch

**File:** `proxy.ts`

**BEFORE:**
```typescript
const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  // BUG: "/api/auth-fake" matches "/api/auth"
}
```

**AFTER:**
```typescript
const EXACT_PUBLIC = new Set(["/login", "/register"]);
const PREFIX_PUBLIC = ["/api/auth/"];

function isPublic(pathname: string) {
  if (EXACT_PUBLIC.has(pathname)) return true;
  return PREFIX_PUBLIC.some((p) => pathname.startsWith(p));
}
```

**Cross-check:**
- [ ] `/login` → public
- [ ] `/api/auth/login` → public
- [ ] `/api/auth-fake` → NOT public (was a bug)
- [ ] `/dashboard` → protected

---

## Phase 2: Error Infrastructure (Week 2)

### 2.1 Create `ApiError` Class + Error Codes

**New file:** `lib/api-error.ts`

```typescript
export const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  FORBIDDEN: "FORBIDDEN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Network
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  BACKEND_UNAVAILABLE: "BACKEND_UNAVAILABLE",

  // Rate Limit
  RATE_LIMITED: "RATE_LIMITED",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_FOUND: "NOT_FOUND",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromResponse(res: Response, fallbackMessage: string): ApiError {
    const code = statusToCode(res.status);
    return new ApiError(code, fallbackMessage, res.status, res.status >= 500);
  }
}

function statusToCode(status: number): ErrorCode {
  switch (status) {
    case 401: return ERROR_CODES.UNAUTHORIZED;
    case 403: return ERROR_CODES.FORBIDDEN;
    case 404: return ERROR_CODES.NOT_FOUND;
    case 429: return ERROR_CODES.RATE_LIMITED;
    default:  return status >= 500
      ? ERROR_CODES.INTERNAL_ERROR
      : ERROR_CODES.VALIDATION_ERROR;
  }
}
```

**Cross-check:**
- [ ] Every HTTP status maps to a code
- [ ] `retryable` is true only for 5xx errors
- [ ] `ApiError instanceof Error` is true
- [ ] Error serializes correctly in React Query

---

### 2.2 Upgrade `httpClient` — Handle All Status Codes

**File:** `lib/http-client.ts`

**BEFORE:**
```typescript
const response = await fetch(url, init);

if (response.status === 401 && typeof globalThis.window !== "undefined") {
  globalThis.window.location.href = "/login";
}

return response;
```

**AFTER:**
```typescript
import { ApiError, ERROR_CODES } from "@/lib/api-error";

const response = await fetch(url, init);

if (typeof globalThis.window !== "undefined") {
  if (response.status === 401) {
    globalThis.window.location.href = "/login";
  }

  if (response.status === 403) {
    throw new ApiError(ERROR_CODES.FORBIDDEN, "Access denied", 403);
  }

  if (response.status === 429) {
    throw new ApiError(ERROR_CODES.RATE_LIMITED, "Too many requests — try again later", 429, true);
  }
}

return response;
```

**Cross-check:**
- [ ] 401 → redirect to login (existing behavior preserved)
- [ ] 403 → throws `ApiError` with code `FORBIDDEN`
- [ ] 429 → throws `ApiError` with `retryable: true`
- [ ] 200 → returns response normally

---

### 2.3 Upgrade `useApiMutation` — Use `ApiError`

**File:** `hooks/use-api-mutation.ts`

**BEFORE:**
```typescript
if (!res.ok) {
  const err = await res.json().catch(() => ({}));
  throw new Error(err.message || errorMessage);
}
```

**AFTER:**
```typescript
import { ApiError } from "@/lib/api-error";

if (!res.ok) {
  let serverMessage: string | undefined;
  try {
    const err = await res.json();
    serverMessage = err.message;
  } catch {
    // JSON parse failed — use fallback
  }
  throw ApiError.fromResponse(res, serverMessage || errorMessage);
}
```

**Cross-check:**
- [ ] JSON parse failure → still throws with correct status code
- [ ] Server returns `{ message: "..." }` → uses server message
- [ ] 500 → `retryable: true`
- [ ] 400 → `retryable: false`

---

### 2.4 Per-Module Error Boundary

**New file:** `components/ui/module-error-boundary.tsx`

```typescript
"use client";

import { ErrorState } from "@/components/ui/error-state";
import { ApiError, ERROR_CODES } from "@/lib/api-error";

export default function ModuleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isApiError = error instanceof ApiError;
  const message = isApiError
    ? getHumanMessage(error.code)
    : error.message || "Something went wrong";

  return <ErrorState message={message} onRetry={reset} />;
}

function getHumanMessage(code: string): string {
  switch (code) {
    case ERROR_CODES.UNAUTHORIZED:     return "Session expired — please log in again";
    case ERROR_CODES.FORBIDDEN:        return "You do not have permission to view this";
    case ERROR_CODES.NOT_FOUND:        return "The requested resource was not found";
    case ERROR_CODES.RATE_LIMITED:     return "Too many requests — please wait and try again";
    case ERROR_CODES.TIMEOUT:          return "Server is taking too long to respond";
    default:                           return "Something went wrong — please try again";
  }
}
```

Then add `error.tsx` in each route group:

```
app/(root)/procurement/error.tsx          → <ModuleError />
app/(root)/inventory-management/error.tsx → <ModuleError />
app/(root)/product-management/error.tsx   → <ModuleError />
app/(root)/vendor-management/error.tsx    → <ModuleError />
app/(root)/system-admin/error.tsx         → <ModuleError />
app/(root)/config/error.tsx               → <ModuleError />
```

**Cross-check:**
- [ ] API error in procurement → only procurement section shows error, sidebar/navbar remain
- [ ] Error shows human-readable message based on error code
- [ ] Retry button works
- [ ] Global error boundary still catches unhandled errors

---

## Phase 3: Runtime API Validation with Zod (Week 2-3)

### 3.1 Create API Response Schemas

**New file:** `lib/api-schemas.ts`

```typescript
import { z } from "zod";

// Base wrapper for all paginated API responses
export const paginateSchema = z.object({
  total: z.number(),
  page: z.number(),
  perpage: z.number(),
  pages: z.number(),
});

export function paginatedResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    paginate: paginateSchema,
  });
}

// API envelope (backend wraps data in { data: ... })
export function apiEnvelope<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({ data: dataSchema });
}
```

### 3.2 Add Schema to a Domain Type (Example: Purchase Request)

**File:** `types/purchase-request.ts` — add at end:

```typescript
import { z } from "zod";

export const purchaseRequestSchema = z.object({
  id: z.string(),
  pr_no: z.string(),
  pr_status: z.string(),
  pr_date: z.string(),
  description: z.string(),
  workflow_current_stage: z.string(),
  requestor_name: z.string(),
  department_name: z.string(),
  // ... add all fields
});

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
```

### 3.3 Validate in Hook

**File:** `hooks/use-purchase-request.ts`

**BEFORE:**
```typescript
const json = await res.json();
const entry = json.data?.[0];
return {
  data: entry?.data ?? [],
  paginate: entry?.paginate ?? { total: 0, page: 1, perpage: 10, pages: 0 },
};
```

**AFTER:**
```typescript
import { purchaseRequestSchema } from "@/types/purchase-request";
import { paginatedResponse } from "@/lib/api-schemas";

const json = await res.json();
const entry = json.data?.[0];

const parsed = paginatedResponse(purchaseRequestSchema).safeParse(entry);

if (!parsed.success) {
  console.error("[PR] API response validation failed:", parsed.error.flatten());
  // Fallback to raw data in production, throw in dev
  if (process.env.NODE_ENV === "development") {
    throw new Error("API response shape mismatch — check console");
  }
}

return parsed.success
  ? parsed.data
  : { data: entry?.data ?? [], paginate: entry?.paginate ?? { total: 0, page: 1, perpage: 10, pages: 0 } };
```

**Cross-check:**
- [ ] Dev: schema mismatch → throws error → developer sees immediately
- [ ] Prod: schema mismatch → logs warning → falls back to raw data (graceful degradation)
- [ ] Correct API response → parsed and typed correctly
- [ ] Performance: `safeParse` adds < 1ms overhead per call

---

## Phase 4: Hooks Architecture (Week 3)

### 4.1 Split `useProfile` into Focused Hooks

**File:** `hooks/use-profile.ts`

**BEFORE:** God hook returning 12+ values, all consumers re-render on any change.

**AFTER:** Split into 3 hooks with stable selectors:

```typescript
// hooks/use-profile.ts — keep as data source
export function useProfile() { /* ... same query logic ... */ }

// hooks/use-bu-code.ts — NEW: only re-renders when buCode changes
export function useBuCode() {
  const { buCode } = useProfile();
  return buCode;
}

// hooks/use-locale.ts — NEW: only re-renders when locale changes
export function useLocale() {
  const { dateFormat, defaultCurrencyCode, defaultCurrencyDecimalPlaces } = useProfile();
  return { dateFormat, defaultCurrencyCode, defaultCurrencyDecimalPlaces };
}
```

Then update consumers:

```diff
// hooks/use-config-crud.ts
- const { buCode } = useProfile();
+ const buCode = useBuCode();

// hooks/use-api-mutation.ts
- const { buCode } = useProfile();
+ const buCode = useBuCode();
```

**Cross-check:**
- [ ] Components that only need `buCode` don't re-render when `dateFormat` changes
- [ ] `useProfile()` still works for components that need everything
- [ ] `useBuCode()` returns same value as `useProfile().buCode`
- [ ] Build passes with no type errors

---

### 4.2 Query Key Factory

**File:** `constant/query-keys.ts`

**BEFORE:**
```typescript
export const QUERY_KEYS = {
  PURCHASE_REQUESTS: "purchase-requests",
  // ...
} as const;

// Usage in hooks:
queryKey: [QUERY_KEYS.PURCHASE_REQUESTS, buCode, params]
```

**AFTER:**
```typescript
export const QUERY_KEYS = {
  PURCHASE_REQUESTS: "purchase-requests",
  // ... keep existing
} as const;

// NEW: Type-safe query key factories
export const queryKeys = {
  purchaseRequests: {
    all: () => [QUERY_KEYS.PURCHASE_REQUESTS] as const,
    lists: () => [...queryKeys.purchaseRequests.all(), "list"] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.purchaseRequests.lists(), buCode, params] as const,
    details: () => [...queryKeys.purchaseRequests.all(), "detail"] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.purchaseRequests.details(), buCode, id] as const,
  },
  vendors: {
    all: () => [QUERY_KEYS.VENDORS] as const,
    list: (buCode: string, params?: ParamsDto) =>
      [...queryKeys.vendors.all(), "list", buCode, params] as const,
    detail: (buCode: string, id: string) =>
      [...queryKeys.vendors.all(), "detail", buCode, id] as const,
  },
  // ... repeat for other domains
} as const;
```

**Usage:**
```diff
// hooks/use-purchase-request.ts
- queryKey: [QUERY_KEYS.PURCHASE_REQUESTS, buCode, params],
+ queryKey: queryKeys.purchaseRequests.list(buCode!, params),

// Invalidation
- invalidateKeys: [QUERY_KEYS.PURCHASE_REQUESTS],
+ invalidateKeys: queryKeys.purchaseRequests.all(), // invalidates all PR queries
```

**Cross-check:**
- [ ] `queryKeys.purchaseRequests.list("BU1", { page: 1 })` returns unique array
- [ ] Invalidating `.all()` clears both list and detail queries
- [ ] TypeScript autocomplete works on all factory methods
- [ ] Cache hit rates remain the same or improve

---

### 4.3 Differentiated Cache Strategy

**File:** `components/providers.tsx`

**BEFORE:** Flat 5-minute staleTime for everything.

**AFTER:**
```typescript
// lib/cache-config.ts — NEW
export const CACHE_PROFILES = {
  /** Rarely changes: permissions, config, units */
  STATIC: { staleTime: 30 * 60 * 1000, gcTime: 60 * 60 * 1000 },

  /** Moderate: vendor list, product catalog */
  NORMAL: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },

  /** Frequently changes: PRs, POs, approvals */
  DYNAMIC: { staleTime: 1 * 60 * 1000, gcTime: 5 * 60 * 1000 },

  /** User profile — never stale unless explicitly refetched */
  PROFILE: { staleTime: Infinity },
} as const;
```

Usage in hooks:
```diff
// hooks/use-config-crud.ts (units, locations, departments = STATIC)
- staleTime: 5 * 60 * 1000,
+ ...CACHE_PROFILES.STATIC,

// hooks/use-purchase-request.ts (PR list = DYNAMIC)
+ ...CACHE_PROFILES.DYNAMIC,

// hooks/use-profile.ts (profile = PROFILE)
  staleTime: Infinity,  // already correct
```

**Cross-check:**
- [ ] Config pages (units, locations) cache for 30 minutes
- [ ] PR/PO lists cache for 1 minute
- [ ] Profile never goes stale
- [ ] gcTime > staleTime for all profiles

---

### 4.4 Optimistic Updates in `useApiMutation`

**File:** `hooks/use-api-mutation.ts`

**AFTER (add optional optimistic support):**
```typescript
interface UseApiMutationOptions<TVariables> {
  mutationFn: (variables: TVariables, buCode: string) => Promise<Response>;
  invalidateKeys?: readonly unknown[];
  errorMessage?: string;
  // NEW: optimistic update support
  optimistic?: {
    queryKey: readonly unknown[];
    updater: (old: unknown, variables: TVariables) => unknown;
  };
}

export function useApiMutation<TVariables, TResponse = unknown>({
  mutationFn,
  invalidateKeys,
  errorMessage = "Request failed",
  optimistic,
}: UseApiMutationOptions<TVariables>) {
  const buCode = useBuCode();
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TVariables, { previous?: unknown }>({
    mutationFn: async (variables) => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await mutationFn(variables, buCode);
      if (!res.ok) {
        let serverMessage: string | undefined;
        try { serverMessage = (await res.json()).message; } catch {}
        throw ApiError.fromResponse(res, serverMessage || errorMessage);
      }
      return res.json();
    },

    onMutate: optimistic
      ? async (variables) => {
          await queryClient.cancelQueries({ queryKey: optimistic.queryKey });
          const previous = queryClient.getQueryData(optimistic.queryKey);
          queryClient.setQueryData(optimistic.queryKey, (old: unknown) =>
            optimistic.updater(old, variables),
          );
          return { previous };
        }
      : undefined,

    onError: optimistic
      ? (_err, _vars, context) => {
          if (context?.previous !== undefined) {
            queryClient.setQueryData(optimistic.queryKey, context.previous);
          }
        }
      : undefined,

    onSettled: () => {
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: Array.isArray(key) ? key : [key],
        });
      });
    },
  });
}
```

**Cross-check:**
- [ ] Without `optimistic` option → behaves exactly like before
- [ ] With `optimistic` → UI updates immediately, rolls back on error
- [ ] `onSettled` always invalidates regardless of success/error
- [ ] TypeScript types work for both cases

---

## Phase 5: Type Safety (Week 3-4)

### 5.1 Fix `any` in Approval Normalization

**File:** `hooks/use-approval.ts`

**BEFORE:**
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizePR(item: any): ApprovalItem { ... }
function normalizePO(item: any): ApprovalItem { ... }
function normalizeSR(item: any): ApprovalItem { ... }
```

**AFTER:**
```typescript
// types/approval.ts — add raw API response shapes
interface RawApprovalPR {
  id: string;
  pr_no: string;
  pr_date: string;
  pr_status: string;
  description: string;
  created_at: string;
  workflow_name: string;
  workflow_current_stage: string;
  workflow_next_stage: string | null;
  workflow_previous_stage: string | null;
  last_action: string | null;
  requestor_name: string;
  department_name: string;
  purchase_request_detail: ApprovalItemDetail[];
}

interface RawApprovalPO {
  id: string;
  po_no: string;
  order_date: string;
  po_status?: string;
  status?: string;
  description: string;
  created_at: string;
  workflow_name: string;
  workflow_current_stage: string;
  workflow_next_stage: string | null;
  workflow_previous_stage: string | null;
  last_action: string | null;
  vendor_name: string;
  total_amount: number;
  delivery_date: string | null;
}

interface RawApprovalSR {
  id: string;
  sr_no: string;
  sr_date: string;
  sr_status?: string;
  status?: string;
  description: string;
  created_at: string;
  workflow_name: string;
  workflow_current_stage: string;
  workflow_next_stage: string | null;
  workflow_previous_stage: string | null;
  last_action: string | null;
  requestor_name: string;
  department_name: string;
}

// hooks/use-approval.ts — no more `any`
function normalizePR(item: RawApprovalPR): ApprovalItem { ... }
function normalizePO(item: RawApprovalPO): ApprovalItem { ... }
function normalizeSR(item: RawApprovalSR): ApprovalItem { ... }
```

**Cross-check:**
- [ ] Zero `eslint-disable` comments for `@typescript-eslint/no-explicit-any`
- [ ] If API adds new field → TypeScript autocomplete shows it
- [ ] If API renames field → TypeScript compile error (caught before runtime)

---

### 5.2 Replace `unknown` with Real Types

**File:** `types/purchase-request.ts`

**BEFORE:**
```typescript
info: Record<string, unknown>;
dimension: unknown[];
```

**AFTER (confirm with backend team for exact shape):**
```typescript
interface PurchaseRequestInfo {
  source?: string;
  reference_no?: string;
  [key: string]: string | number | boolean | undefined;
}

interface DimensionEntry {
  name: string;
  value: string;
}

// Then in PurchaseRequestDetail:
info: PurchaseRequestInfo;
dimension: DimensionEntry[];
```

**Cross-check:**
- [ ] Backend team confirms `info` and `dimension` shapes
- [ ] Existing code that reads `info` or `dimension` still compiles
- [ ] No `unknown` or `any` remaining in types/

---

## Phase 6: Component Performance (Week 4)

### 6.1 Add `React.memo` to Heavy Components

```typescript
// components/ui/data-grid/data-grid-table.tsx
export const DataGridTable = React.memo(DataGridTableInner);

// components/ui/transfer.tsx
export const Transfer = React.memo(TransferInner);

// components/ui/tree-product-lookup.tsx
export const TreeProductLookup = React.memo(TreeProductLookupInner);
```

### 6.2 Extract Shared Spinner Component

**New file:** `components/ui/spinner.tsx`

```typescript
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-6 w-6 animate-spin text-muted-foreground", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
```

Then replace duplicated SVG in `data-grid-table.tsx` (2 locations).

**Cross-check:**
- [ ] DataGrid loading spinner looks identical to before
- [ ] No duplicate SVG in codebase (`grep -r 'animate-spin' components/ui/data-grid`)
- [ ] Build passes

---

## Phase 7: Accessibility (Week 4-5)

### 7.1 Table ARIA Attributes

**File:** `components/ui/data-grid/data-grid-table.tsx`

```diff
// Header cells
- <th className={...}>
+ <th scope="col" className={...}>

// Body rows
- <tr className={...}>
+ <tr aria-rowindex={rowIndex + 1} className={...}>

// Body cells
- <td className={...}>
+ <td aria-colindex={cellIndex + 1} className={...}>
```

### 7.2 Pagination Announcement

```diff
// components/ui/data-grid/data-grid-pagination.tsx
- <div className="...">
+ <div className="..." role="navigation" aria-label="Pagination">
+   <div aria-live="polite" className="sr-only">
+     Page {currentPage} of {totalPages}, showing {data.length} results
+   </div>
```

**Cross-check:**
- [ ] Screen reader announces page change
- [ ] `scope="col"` on all `<th>` elements
- [ ] `aria-rowindex` starts at 1, not 0
- [ ] axe-core audit shows 0 critical violations

---

## Symmetric Cross-Check Matrix

Validate that changes in one area don't break another:

| Changed | Auth | Hooks | Types | Components | Tests |
|---|---|---|---|---|---|
| **Proxy hardening** | Verify auto-refresh with timeout | Verify mutations still work | N/A | Verify loading states show on timeout | Add proxy timeout test |
| **Cookie fix** | Verify login/logout flow | Verify `useProfile` loads | N/A | N/A | Add cookie path test |
| **ApiError class** | Verify 401 redirect | Verify `useApiMutation` catches | Import type in hooks | Error boundary shows message | Add error code mapping test |
| **httpClient upgrade** | N/A | All hooks use httpClient | N/A | N/A | Update httpClient tests |
| **Zod validation** | N/A | Add `.safeParse()` in hooks | Schema matches interface | N/A | Add schema validation test |
| **useProfile split** | N/A | Update all `useProfile()` calls | N/A | Verify no extra re-renders | Update useProfile tests |
| **Query key factory** | N/A | Update all queryKey usages | N/A | N/A | Add cache invalidation test |
| **React.memo** | N/A | N/A | N/A | Verify re-render reduction | Add React profiler test |
| **ARIA attributes** | N/A | N/A | N/A | Verify screen reader | Add axe-core test |

---

## Test Plan

### New Tests Required

| Test File | What to Test |
|---|---|
| `lib/__tests__/api-error.test.ts` | Error code mapping, `fromResponse()`, serialization |
| `lib/__tests__/http-client.test.ts` | Add 403, 429 handling tests |
| `app/api/proxy/__tests__/route.test.ts` | Path traversal, timeout, body limit |
| `hooks/__tests__/use-api-mutation.test.ts` | Optimistic updates, rollback, error codes |
| `types/__tests__/purchase-request.test.ts` | Zod schema validates real API fixture |

### Regression Tests

| Test | What to Verify |
|---|---|
| Login flow | Cookies set correctly with new path |
| Logout flow | Backend notified, cookies cleared |
| Auto-refresh | Works with timeout, works with new cookie path |
| PR CRUD | Create, update, delete with optimistic updates |
| Approval list | Normalized correctly with typed normalizers |

---

## Timeline

| Week | Phase | Deliverables |
|---|---|---|
| 1 | Security Hardening | Proxy hardening, cookie fix, logout fix, path matching |
| 2 | Error Infrastructure | ApiError class, httpClient upgrade, error boundaries |
| 2-3 | Zod Validation | API schemas, hook validation, dev-mode strict |
| 3 | Hooks Architecture | useProfile split, query key factory, cache strategy |
| 4 | Performance | React.memo, spinner extraction, optimistic updates |
| 4-5 | Accessibility | ARIA attributes, keyboard nav, screen reader |
| 5 | Testing | New tests + regression for all changes |

---

## Expected Outcome

| Category | Before | After |
|---|---|---|
| Security & Auth | 4/10 | **8/10** |
| State Management | 5/10 | **8/10** |
| Type Safety | 4/10 | **8/10** |
| Error Handling | 3.5/10 | **8/10** |
| Component Architecture | 5.5/10 | **7.5/10** |
| Performance | 6/10 | **8/10** |
| Accessibility | 2/10 | **7/10** |
| Test Coverage | 3/10 | **7/10** |
| **Overall** | **4.1/10** | **7.7/10** |
