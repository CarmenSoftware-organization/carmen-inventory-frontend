import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "../http-client";
import { ApiError } from "../api-error";

describe("httpClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends GET request", async () => {
    const mockResponse = new Response(JSON.stringify({ data: [] }), {
      status: 200,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const res = await httpClient.get("/api/test");

    expect(fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "GET",
        headers: undefined,
        signal: expect.any(AbortSignal),
      }),
    );
    expect(res.status).toBe(200);
  });

  it("sends POST request with JSON body", async () => {
    const mockResponse = new Response(JSON.stringify({ id: "1" }), {
      status: 201,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const body = { name: "Test", is_active: true };
    await httpClient.post("/api/test", body);

    expect(fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("sends POST with FormData without Content-Type", async () => {
    const mockResponse = new Response(JSON.stringify({ data: {} }), {
      status: 200,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const formData = new FormData();
    formData.append("file", new Blob(["test"]), "test.txt");
    await httpClient.post("/api/upload", formData);

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(formData);
    // Content-Type should NOT be set — browser sets multipart boundary
    expect(init.headers).toBeUndefined();
  });

  it("sends PUT request with JSON body", async () => {
    const mockResponse = new Response(JSON.stringify({}), { status: 200 });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const body = { name: "Updated" };
    await httpClient.put("/api/test/1", body);

    expect(fetch).toHaveBeenCalledWith(
      "/api/test/1",
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("sends PATCH request with JSON body", async () => {
    const mockResponse = new Response(JSON.stringify({}), { status: 200 });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const body = { is_active: false };
    await httpClient.patch("/api/test/1", body);

    expect(fetch).toHaveBeenCalledWith(
      "/api/test/1",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("sends DELETE request without body", async () => {
    const mockResponse = new Response(null, { status: 204 });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    await httpClient.delete("/api/test/1");

    expect(fetch).toHaveBeenCalledWith(
      "/api/test/1",
      expect.objectContaining({
        method: "DELETE",
        headers: undefined,
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("redirects to /login on 401 response", async () => {
    const mockResponse = new Response(null, { status: 401 });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const originalLocation = globalThis.window.location;
    Object.defineProperty(globalThis.window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });

    await httpClient.get("/api/test");

    expect(globalThis.window.location.href).toBe("/login");

    Object.defineProperty(globalThis.window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("throws ApiError with FORBIDDEN code on 403", async () => {
    const mockResponse = new Response(JSON.stringify({}), { status: 403 });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    try {
      await httpClient.get("/api/admin");
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe("FORBIDDEN");
      expect((err as ApiError).statusCode).toBe(403);
    }
  });

  it("throws ApiError with RATE_LIMITED code on 429", async () => {
    const mockResponse = new Response(JSON.stringify({}), { status: 429 });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

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

  it("does NOT throw on 403 when window is undefined (server-side)", async () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - simulating server environment
    delete globalThis.window;

    const mockResponse = new Response(JSON.stringify({}), { status: 403 });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const res = await httpClient.get("/api/admin");
    expect(res.status).toBe(403);

    globalThis.window = originalWindow;
  });

  it("throws TIMEOUT error when fetch times out", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    );

    vi.useFakeTimers();

    const promise = httpClient.get("/api/test");
    vi.advanceTimersByTime(15_000);

    await expect(promise).rejects.toThrow("Request timed out");

    vi.useRealTimers();
  });
});
