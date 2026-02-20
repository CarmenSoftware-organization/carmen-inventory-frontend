import { ApiError, ERROR_CODES } from "@/lib/api-error";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  body?: unknown;
}

async function request(
  url: string,
  method: HttpMethod,
  options?: RequestOptions,
): Promise<Response> {
  const { body, headers, ...rest } = options ?? {};

  const init: RequestInit = {
    method,
    ...rest,
  };

  if (body !== undefined) {
    init.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
    init.body = JSON.stringify(body);
  } else {
    init.headers = headers;
  }

  const response = await fetch(url, init);

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
