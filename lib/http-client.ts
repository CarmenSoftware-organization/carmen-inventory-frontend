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

  return fetch(url, init);
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
