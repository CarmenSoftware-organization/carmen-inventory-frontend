import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { httpClient } from "./http-client";
import { ApiError } from "./api-error";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  // Simulate browser environment
  vi.stubGlobal("window", { location: { href: "" } });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("httpClient.get", () => {
  it("sends GET request with correct URL", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const res = await httpClient.get("/api/test");
    expect(fetchMock).toHaveBeenCalledWith("/api/test", expect.objectContaining({ method: "GET" }));
    expect(res.status).toBe(200);
  });
});

describe("httpClient.post", () => {
  it("sends POST with JSON body and Content-Type header", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(201));
    await httpClient.post("/api/items", { name: "test" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ name: "test" });
  });
});

describe("httpClient.put", () => {
  it("sends PUT request", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200));
    await httpClient.put("/api/items/1", { name: "updated" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("PUT");
  });
});

describe("httpClient.patch", () => {
  it("sends PATCH request", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200));
    await httpClient.patch("/api/items/1", { name: "patched" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("PATCH");
  });
});

describe("httpClient.delete", () => {
  it("sends DELETE request without body", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await httpClient.delete("/api/items/1");
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("DELETE");
    expect(init.body).toBeUndefined();
  });
});

describe("401 handling (browser)", () => {
  it("redirects to /login on 401", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401));
    const res = await httpClient.get("/api/protected");
    expect(res.status).toBe(401);
    expect(globalThis.window.location.href).toBe("/login");
  });
});

describe("403 handling (browser)", () => {
  it("throws ApiError with FORBIDDEN code", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(403));
    try {
      await httpClient.get("/api/admin");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe("FORBIDDEN");
      expect((err as ApiError).statusCode).toBe(403);
    }
  });
});

describe("429 handling (browser)", () => {
  it("throws ApiError with RATE_LIMITED code and retryable=true", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(429));
    try {
      await httpClient.get("/api/data");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe("RATE_LIMITED");
      expect((err as ApiError).statusCode).toBe(429);
      expect((err as ApiError).retryable).toBe(true);
    }
  });
});

describe("server-side (no window)", () => {
  it("does NOT throw on 403 when window is undefined", async () => {
    vi.stubGlobal("window", undefined);
    fetchMock.mockResolvedValueOnce(jsonResponse(403));
    const res = await httpClient.get("/api/admin");
    expect(res.status).toBe(403);
  });

  it("does NOT throw on 429 when window is undefined", async () => {
    vi.stubGlobal("window", undefined);
    fetchMock.mockResolvedValueOnce(jsonResponse(429));
    const res = await httpClient.get("/api/data");
    expect(res.status).toBe(429);
  });
});
