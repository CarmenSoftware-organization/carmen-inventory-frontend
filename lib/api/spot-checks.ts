import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { SpotCheck, CreateSpotCheckDto } from "@/types/spot-check";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getSpotChecks(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<SpotCheck>> {
  const url = buildUrl(API_ENDPOINTS.SPOT_CHECK(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch spot checks");
  return res.json();
}

export async function getSpotCheckById(
  buCode: string,
  id: string,
): Promise<SpotCheck> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.SPOT_CHECK(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch spot check");
  const json = await res.json();
  return json.data;
}

export async function createSpotCheck(
  buCode: string,
  data: CreateSpotCheckDto,
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.SPOT_CHECK(buCode), data);
}

export async function updateSpotCheck(
  buCode: string,
  id: string,
  data: CreateSpotCheckDto,
): Promise<Response> {
  return httpClient.put(`${API_ENDPOINTS.SPOT_CHECK(buCode)}/${id}`, data);
}

export async function deleteSpotCheck(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(`${API_ENDPOINTS.SPOT_CHECK(buCode)}/${id}`);
}
