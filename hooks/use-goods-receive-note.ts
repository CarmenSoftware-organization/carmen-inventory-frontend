import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { GoodsReceiveNote, CreateGrnDto } from "@/types/goods-receive-note";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import * as api from "@/lib/api/goods-receive-notes";

export function useGoodsReceiveNote(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<GoodsReceiveNote>>({
    queryKey: [QUERY_KEYS.GOODS_RECEIVE_NOTES, buCode, params],
    queryFn: () => api.getGoodsReceiveNotes(buCode!, params),
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function useGoodsReceiveNoteById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<GoodsReceiveNote>({
    queryKey: [QUERY_KEYS.GOODS_RECEIVE_NOTES, buCode, id],
    queryFn: () => api.getGoodsReceiveNoteById(buCode!, id!),
    enabled: !!buCode && !!id,
  });
}

export function useCreateGoodsReceiveNote() {
  return useApiMutation<CreateGrnDto>({
    mutationFn: (data, buCode) => api.createGoodsReceiveNote(buCode, data),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTES],
    errorMessage: "Failed to create goods receive note",
  });
}

export function useUpdateGoodsReceiveNote() {
  return useApiMutation<CreateGrnDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      api.updateGoodsReceiveNote(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTES],
    errorMessage: "Failed to update goods receive note",
  });
}

export function useDeleteGoodsReceiveNote() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.deleteGoodsReceiveNote(buCode, id),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTES],
    errorMessage: "Failed to delete goods receive note",
  });
}
