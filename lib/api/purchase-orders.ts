import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { PurchaseOrder, CreatePoDto } from "@/types/purchase-order";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getPurchaseOrders(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<PurchaseOrder>> {
  const url = buildUrl(API_ENDPOINTS.PURCHASE_ORDER(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch purchase orders");
  return res.json();
}

export async function getPurchaseOrderById(
  buCode: string,
  id: string,
): Promise<PurchaseOrder> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch purchase order");
  const json = await res.json();
  return json.data;
}

export async function createPurchaseOrder(
  buCode: string,
  data: CreatePoDto,
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.PURCHASE_ORDER(buCode), data);
}

export async function updatePurchaseOrder(
  buCode: string,
  id: string,
  data: CreatePoDto,
): Promise<Response> {
  return httpClient.put(
    `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}`,
    data,
  );
}

export async function deletePurchaseOrder(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(`${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}`);
}

export async function approvePurchaseOrder(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.post(
    `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}/approve`,
  );
}

export async function cancelPurchaseOrder(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.post(
    `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}/cancel`,
  );
}

export async function closePurchaseOrder(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.post(
    `${API_ENDPOINTS.PURCHASE_ORDER(buCode)}/${id}/close`,
  );
}
