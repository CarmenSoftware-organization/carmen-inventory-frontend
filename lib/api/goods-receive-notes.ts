import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type {
  GoodsReceiveNote,
  CreateGrnDto,
} from "@/types/goods-receive-note";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getGoodsReceiveNotes(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<GoodsReceiveNote>> {
  const url = buildUrl(API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch goods receive notes");
  return res.json();
}

export async function getGoodsReceiveNoteById(
  buCode: string,
  id: string,
): Promise<GoodsReceiveNote> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch goods receive note");
  const json = await res.json();
  return json.data;
}

export async function createGoodsReceiveNote(
  buCode: string,
  data: CreateGrnDto,
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode), data);
}

export async function updateGoodsReceiveNote(
  buCode: string,
  id: string,
  data: CreateGrnDto,
): Promise<Response> {
  return httpClient.put(
    `${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${id}`,
    data,
  );
}

export async function deleteGoodsReceiveNote(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(
    `${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${id}`,
  );
}

export async function confirmGoodsReceiveNote(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.patch(
    `${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${id}/confirm`,
  );
}

export async function rejectGoodsReceiveNote(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.post(
    `${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${id}/reject`,
  );
}
