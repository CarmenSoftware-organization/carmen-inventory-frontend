import { ApiError, ERROR_CODES } from "@/lib/api-error";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  body?: unknown;
}

// ---------------------------------------------------------------------------
// Client-side sliding-window rate limiter
// Prevents runaway loops from flooding the backend.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds
const RATE_LIMIT_MAX_REQUESTS = 50; // max requests per window

const requestTimestamps: number[] = [];

function checkRateLimit(): void {
  if (typeof globalThis.window === "undefined") return; // server-side — skip

  const now = Date.now();
  // Remove timestamps outside the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    throw new ApiError(
      ERROR_CODES.RATE_LIMITED,
      "Too many requests — please slow down",
      429,
      true,
    );
  }

  requestTimestamps.push(now);
}

const FETCH_TIMEOUT_MS = 15_000; // 15s

async function request(
  url: string,
  method: HttpMethod,
  options?: RequestOptions,
): Promise<Response> {
  checkRateLimit();

  const { body, headers, ...rest } = options ?? {};

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const init: RequestInit = {
    method,
    signal: controller.signal,
    ...rest,
  };

  if (body instanceof FormData) {
    // Let the browser set Content-Type with multipart boundary
    init.headers = headers;
    init.body = body;
  } else if (body !== undefined) {
    init.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
    init.body = JSON.stringify(body);
  } else {
    init.headers = headers;
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(ERROR_CODES.TIMEOUT, "Request timed out", 408, true);
    }
    throw new ApiError(ERROR_CODES.NETWORK_ERROR, "Network error", undefined, true);
  }
  clearTimeout(timeout);

  if (typeof globalThis.window !== "undefined") {
    if (response.status === 401) {
      globalThis.window.location.href = "/login";
    }

    if (response.status === 403) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, "Access denied", 403);
    }

    if (response.status === 429) {
      throw new ApiError(
        ERROR_CODES.RATE_LIMITED,
        "Too many requests — try again later",
        429,
        true,
      );
    }
  }

  return response;
}

export const httpClient = {
  get: (url: string, options?: Omit<RequestOptions, "body">) =>
    request(url, "GET", options),

  post: (url: string, body?: unknown, options?: RequestOptions) =>
    request(url, "POST", { ...options, body }),

  put: (url: string, body?: unknown, options?: RequestOptions) =>
    request(url, "PUT", { ...options, body }),

  patch: (url: string, body?: unknown, options?: RequestOptions) =>
    request(url, "PATCH", { ...options, body }),

  delete: (url: string, options?: RequestOptions) =>
    request(url, "DELETE", options),
};
