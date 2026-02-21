import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { PeriodEnd, CreatePeriodEndDto } from "@/types/period-end";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getPeriodEnds(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<PeriodEnd>> {
  const url = buildUrl(API_ENDPOINTS.PERIOD_END(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch period ends");
  return res.json();
}

export async function getPeriodEndById(
  buCode: string,
  id: string,
): Promise<PeriodEnd> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.PERIOD_END(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch period end");
  const json = await res.json();
  return json.data;
}

export async function createPeriodEnd(
  buCode: string,
  data: CreatePeriodEndDto,
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.PERIOD_END(buCode), data);
}

export async function updatePeriodEnd(
  buCode: string,
  id: string,
  data: CreatePeriodEndDto,
): Promise<Response> {
  return httpClient.put(`${API_ENDPOINTS.PERIOD_END(buCode)}/${id}`, data);
}

export async function deletePeriodEnd(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(`${API_ENDPOINTS.PERIOD_END(buCode)}/${id}`);
}
