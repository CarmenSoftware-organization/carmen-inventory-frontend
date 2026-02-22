import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { QUERY_KEYS } from "@/constant/query-keys";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { CreditNote, CreateCnDto } from "@/types/credit-note";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import type { CommentAttachment, CommentItem } from "@/components/ui/comment-sheet";
import { CACHE_DYNAMIC } from "@/lib/cache-config";
import * as api from "@/lib/api/credit-notes";

export function useCreditNote(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<CreditNote>>({
    queryKey: [QUERY_KEYS.CREDIT_NOTES, buCode, params],
    queryFn: () => api.getCreditNotes(buCode!, params),
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function useCreditNoteById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<CreditNote>({
    queryKey: [QUERY_KEYS.CREDIT_NOTES, buCode, id],
    queryFn: () => api.getCreditNoteById(buCode!, id!),
    enabled: !!buCode && !!id,
  });
}

export function useCreateCreditNote() {
  return useApiMutation<CreateCnDto>({
    mutationFn: (data, buCode) => api.createCreditNote(buCode, data),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTES],
    errorMessage: "Failed to create credit note",
  });
}

export function useUpdateCreditNote() {
  return useApiMutation<CreateCnDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      api.updateCreditNote(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTES],
    errorMessage: "Failed to update credit note",
  });
}

export function useDeleteCreditNote() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.deleteCreditNote(buCode, id),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTES],
    errorMessage: "Failed to delete credit note",
  });
}

// --- Comments ---

export function useCreditNoteComments(cnId: string | undefined) {
  const buCode = useBuCode();

  return useQuery<CommentItem[]>({
    queryKey: [QUERY_KEYS.CREDIT_NOTE_COMMENTS, buCode, cnId],
    queryFn: async () => {
      if (!buCode || !cnId) throw new Error("Missing buCode or cnId");
      const res = await httpClient.get(
        `${API_ENDPOINTS.CREDIT_NOTE(buCode)}/${cnId}/comment`,
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode && !!cnId,
  });
}

interface CreateCreditNoteCommentDto {
  credit_note_id: string;
  message: string;
  type: string;
  attachments: CommentAttachment[];
}

export function useCreateCreditNoteComment() {
  return useApiMutation<CreateCreditNoteCommentDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.CREDIT_NOTE_COMMENT(buCode), data),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTE_COMMENTS],
    errorMessage: "Failed to add comment",
  });
}

export function useUpdateCreditNoteComment() {
  return useApiMutation<{
    id: string;
    message: string;
    attachments: CommentAttachment[];
  }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.patch(
        `${API_ENDPOINTS.CREDIT_NOTE_COMMENT(buCode)}/${id}`,
        data,
      ),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTE_COMMENTS],
    errorMessage: "Failed to update comment",
  });
}

export function useDeleteCreditNoteComment() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(
        `${API_ENDPOINTS.CREDIT_NOTE_COMMENT(buCode)}/${id}`,
      ),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTE_COMMENTS],
    errorMessage: "Failed to delete comment",
  });
}

export async function uploadCnCommentAttachment(
  buCode: string,
  cnId: string,
  file: File,
): Promise<CommentAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    API_ENDPOINTS.CREDIT_NOTE_COMMENT_ATTACHMENT(buCode, cnId),
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Failed to upload attachment");
  const json = await res.json();
  return json.data;
}
