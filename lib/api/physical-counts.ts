import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type {
  PhysicalCount,
  CreatePhysicalCountDto,
} from "@/types/physical-count";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getPhysicalCounts(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<PhysicalCount>> {
  const url = buildUrl(API_ENDPOINTS.PHYSICAL_COUNT(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch physical counts");
  return res.json();
}

export async function getPhysicalCountById(
  buCode: string,
  id: string,
): Promise<PhysicalCount> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.PHYSICAL_COUNT(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch physical count");
  const json = await res.json();
  return json.data;
}

export async function createPhysicalCount(
  buCode: string,
  data: CreatePhysicalCountDto,
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.PHYSICAL_COUNT(buCode), data);
}

export async function updatePhysicalCount(
  buCode: string,
  id: string,
  data: CreatePhysicalCountDto,
): Promise<Response> {
  return httpClient.put(
    `${API_ENDPOINTS.PHYSICAL_COUNT(buCode)}/${id}`,
    data,
  );
}

export async function deletePhysicalCount(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(`${API_ENDPOINTS.PHYSICAL_COUNT(buCode)}/${id}`);
}
