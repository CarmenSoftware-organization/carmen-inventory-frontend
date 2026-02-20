import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

// Set env before importing route
vi.stubEnv("BACKEND_URL", "https://api.example.com");
vi.stubEnv("X_APP_ID", "test-app-id");

// Dynamic import after mocks are set up
const { GET, POST } = await import("../[...path]/route");

function makeRequest(
  method: string,
  path: string,
  options?: { body?: string; headers?: Record<string, string> },
) {
  const url = `http://localhost:3000/api/proxy/${path}`;
  const init: RequestInit = { method };
  if (options?.headers) {
    init.headers = options.headers;
  }
  if (options?.body) {
    init.body = options.body;
    init.headers = {
      ...init.headers,
      "content-length": String(new TextEncoder().encode(options.body).length),
    };
  }
  return new NextRequest(url, init);
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  mockCookieStore.get.mockImplementation((name: string) => {
    if (name === "access_token") return { value: "valid-token" };
    return undefined;
  });
});

describe("path traversal validation", () => {
  it("rejects paths with '..'", async () => {
    const req = makeRequest("GET", "api/../admin/secret");
    const res = await GET(req, { params: Promise.resolve({ path: ["api", "..", "admin", "secret"] }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid path");
  });

  it("rejects paths with '//'", async () => {
    const req = makeRequest("GET", "api//admin");
    const res = await GET(req, { params: Promise.resolve({ path: ["api", "", "admin"] }) });
    // The joined path "api//admin" contains "//"
    expect(res.status).toBe(400);
  });

  it("allows normal paths", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"ok":true}', {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const req = makeRequest("GET", "api/v1/items");
    const res = await GET(req, { params: Promise.resolve({ path: ["api", "v1", "items"] }) });
    expect(res.status).toBe(200);
  });
});

describe("authentication", () => {
  it("returns 401 when no tokens are available", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "no" }), { status: 401 }),
    );

    const req = makeRequest("GET", "api/data");
    const res = await GET(req, { params: Promise.resolve({ path: ["api", "data"] }) });
    expect(res.status).toBe(401);
  });

  it("sends Authorization header with access token", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"ok":true}', {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const req = makeRequest("GET", "api/data");
    await GET(req, { params: Promise.resolve({ path: ["api", "data"] }) });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer valid-token");
    expect(init.headers["x-app-id"]).toBe("test-app-id");
  });
});

describe("body size limit", () => {
  it("rejects POST body larger than 1MB", async () => {
    const largeBody = "x".repeat(1024 * 1024 + 1); // 1MB + 1 byte
    const req = makeRequest("POST", "api/upload", {
      body: largeBody,
      headers: {
        "content-type": "application/json",
        "content-length": String(largeBody.length),
      },
    });
    const res = await POST(req, { params: Promise.resolve({ path: ["api", "upload"] }) });
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.error).toBe("Payload too large");
  });

  it("allows POST body within limit", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"ok":true}', {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const smallBody = JSON.stringify({ name: "test" });
    const req = makeRequest("POST", "api/items", {
      body: smallBody,
      headers: {
        "content-type": "application/json",
        "content-length": String(smallBody.length),
      },
    });
    const res = await POST(req, { params: Promise.resolve({ path: ["api", "items"] }) });
    expect(res.status).toBe(200);
  });
});

describe("timeout handling", () => {
  it("returns 504 on backend timeout (AbortError)", async () => {
    fetchMock.mockRejectedValueOnce(
      Object.assign(new DOMException("The operation was aborted", "AbortError")),
    );
    const req = makeRequest("GET", "api/slow");
    const res = await GET(req, { params: Promise.resolve({ path: ["api", "slow"] }) });
    expect(res.status).toBe(504);
    const body = await res.json();
    expect(body.error).toBe("Backend timeout");
  });

  it("returns 502 on generic fetch error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const req = makeRequest("GET", "api/down");
    const res = await GET(req, { params: Promise.resolve({ path: ["api", "down"] }) });
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("Internal proxy error");
  });
});

describe("security headers", () => {
  it("includes security headers in response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"ok":true}', {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const req = makeRequest("GET", "api/data");
    const res = await GET(req, { params: Promise.resolve({ path: ["api", "data"] }) });

    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
});
