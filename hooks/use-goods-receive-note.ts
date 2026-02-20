import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { GoodsReceiveNote, CreateGrnDto } from "@/types/goods-receive-note";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";

export function useGoodsReceiveNote(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<GoodsReceiveNote>>({
    queryKey: [QUERY_KEYS.GOODS_RECEIVE_NOTES, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch goods receive notes");
      return res.json();
    },
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function useGoodsReceiveNoteById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<GoodsReceiveNote>({
    queryKey: [QUERY_KEYS.GOODS_RECEIVE_NOTES, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch goods receive note");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreateGoodsReceiveNote() {
  return useApiMutation<CreateGrnDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode), data),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTES],
    errorMessage: "Failed to create goods receive note",
  });
}

export function useUpdateGoodsReceiveNote() {
  return useApiMutation<CreateGrnDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(`${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${id}`, data),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTES],
    errorMessage: "Failed to update goods receive note",
  });
}

export function useDeleteGoodsReceiveNote() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTES],
    errorMessage: "Failed to delete goods receive note",
  });
}
