import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { PurchaseRequestTemplate } from "@/types/purchase-request";
import type { CreatePrtDto } from "@/hooks/use-prt";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getPrts(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<PurchaseRequestTemplate>> {
  const url = buildUrl(
    API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode),
    params,
  );
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch purchase request templates");
  return res.json();
}

export async function getPrtById(
  buCode: string,
  id: string,
): Promise<PurchaseRequestTemplate> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch purchase request template");
  const json = await res.json();
  return json.data;
}

export async function createPrt(
  buCode: string,
  data: CreatePrtDto,
): Promise<Response> {
  return httpClient.post(
    API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode),
    data,
  );
}

export async function updatePrt(
  buCode: string,
  id: string,
  data: CreatePrtDto,
): Promise<Response> {
  return httpClient.put(
    `${API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode)}/${id}`,
    data,
  );
}

export async function deletePrt(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(
    `${API_ENDPOINTS.PURCHASE_REQUEST_TEMPLATES(buCode)}/${id}`,
  );
}
