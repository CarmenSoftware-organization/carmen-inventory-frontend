import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

interface ConfigApiOptions {
  endpoint: (buCode: string) => string;
  label: string;
  updateMethod?: "PUT" | "PATCH";
}

export function createConfigApi<T, TCreate>({
  endpoint,
  label,
  updateMethod = "PUT",
}: ConfigApiOptions) {
  const methodMap = { PUT: "put", PATCH: "patch" } as const;
  const httpMethod = methodMap[updateMethod];

  async function getList(
    buCode: string,
    params?: ParamsDto,
  ): Promise<PaginatedResponse<T>> {
    const url = buildUrl(endpoint(buCode), params);
    const res = await httpClient.get(url);
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
  }

  async function getById(buCode: string, id: string): Promise<T> {
    const res = await httpClient.get(`${endpoint(buCode)}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch record");
    const json = await res.json();
    return json.data;
  }

  async function create(buCode: string, data: TCreate): Promise<Response> {
    return httpClient.post(endpoint(buCode), data);
  }

  async function update(
    buCode: string,
    id: string,
    data: TCreate,
  ): Promise<Response> {
    return httpClient[httpMethod](`${endpoint(buCode)}/${id}`, data);
  }

  async function remove(buCode: string, id: string): Promise<Response> {
    return httpClient.delete(`${endpoint(buCode)}/${id}`);
  }

  return { getList, getById, create, update, remove };
}
