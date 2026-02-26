import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { GoodsReceiveNote, CreateGrnDto } from "@/types/goods-receive-note";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import type { CommentAttachment, CommentItem } from "@/components/ui/comment-sheet";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import { ApiError, ERROR_CODES } from "@/lib/api-error";
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

// --- Comments ---

export function useGoodsReceiveNoteComments(grnId: string | undefined) {
  const buCode = useBuCode();

  return useQuery<CommentItem[]>({
    queryKey: [QUERY_KEYS.GOODS_RECEIVE_NOTE_COMMENTS, buCode, grnId],
    queryFn: async () => {
      if (!buCode || !grnId) throw new ApiError(ERROR_CODES.MISSING_REQUIRED_FIELD, "Missing buCode or grnId");
      const res = await httpClient.get(
        `${API_ENDPOINTS.GOODS_RECEIVE_NOTE(buCode)}/${grnId}/comment`,
      );
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch comments");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!grnId,
  });
}

interface CreateGrnCommentDto {
  good_received_note_id: string;
  message: string;
  type: string;
  attachments: CommentAttachment[];
}

export function useCreateGrnComment() {
  return useApiMutation<CreateGrnCommentDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.GOODS_RECEIVE_NOTE_COMMENT(buCode), data),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTE_COMMENTS],
    errorMessage: "Failed to add comment",
  });
}

export function useUpdateGrnComment() {
  return useApiMutation<{
    id: string;
    message: string;
    attachments: CommentAttachment[];
  }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.patch(
        `${API_ENDPOINTS.GOODS_RECEIVE_NOTE_COMMENT(buCode)}/${id}`,
        data,
      ),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTE_COMMENTS],
    errorMessage: "Failed to update comment",
  });
}

export function useDeleteGrnComment() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(
        `${API_ENDPOINTS.GOODS_RECEIVE_NOTE_COMMENT(buCode)}/${id}`,
      ),
    invalidateKeys: [QUERY_KEYS.GOODS_RECEIVE_NOTE_COMMENTS],
    errorMessage: "Failed to delete comment",
  });
}

export async function uploadGrnCommentAttachment(
  buCode: string,
  grnId: string,
  file: File,
): Promise<CommentAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await httpClient.post(
    API_ENDPOINTS.GOODS_RECEIVE_NOTE_COMMENT_ATTACHMENT(buCode, grnId),
    formData,
  );

  if (!res.ok) throw ApiError.fromResponse(res, "Failed to upload attachment");
  const json = await res.json();
  return json.data;
}
