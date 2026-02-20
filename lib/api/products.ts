import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { Product } from "@/types/product";
import type { PaginatedResponse } from "@/types/params";

export async function getAllProducts(buCode: string): Promise<Product[]> {
  const url = buildUrl(API_ENDPOINTS.PRODUCTS(buCode), { perpage: -1 });
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch products");
  const json: PaginatedResponse<Product> = await res.json();
  return json.data;
}

export async function getProductsByLocation(
  buCode: string,
  locationId: string,
): Promise<Product[]> {
  const res = await httpClient.get(
    API_ENDPOINTS.PRODUCTS_BY_LOCATION(buCode, locationId),
  );
  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  return json.data ?? [];
}

export interface ProductUnit {
  id: string;
  name: string;
  conversion: number;
}

export async function getProductUnits(
  buCode: string,
  productId: string,
): Promise<ProductUnit[]> {
  const res = await httpClient.get(
    API_ENDPOINTS.PRODUCT_UNITS_FOR_ORDER(buCode, productId),
  );
  if (!res.ok) throw new Error("Failed to fetch product units");
  const json = await res.json();
  return json.data ?? [];
}

export interface InventoryBalance {
  on_hand_qty: number;
  on_order_qty: number;
  re_order_qty: number;
  re_stock_qty: number;
}

export async function getProductInventory(
  buCode: string,
  locationId: string,
  productId: string,
): Promise<InventoryBalance> {
  const res = await httpClient.get(
    API_ENDPOINTS.PRODUCT_INVENTORY(buCode, locationId, productId),
  );
  if (!res.ok) throw new Error("Failed to fetch inventory");
  const json = await res.json();
  return json.data;
}
