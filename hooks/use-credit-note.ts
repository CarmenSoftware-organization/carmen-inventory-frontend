import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { CreditNote, CreateCnDto } from "@/types/credit-note";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
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
