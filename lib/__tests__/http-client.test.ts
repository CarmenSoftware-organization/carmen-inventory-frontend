import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "../http-client";

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

    // Mock window.location
    const originalLocation = globalThis.window.location;
    Object.defineProperty(globalThis.window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });

    await httpClient.get("/api/test");

    expect(globalThis.window.location.href).toBe("/login");

    // Restore
    Object.defineProperty(globalThis.window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
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
