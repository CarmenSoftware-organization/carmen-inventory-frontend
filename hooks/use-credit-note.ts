import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { CreditNote, CreateCnDto } from "@/types/credit-note";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export function useCreditNote(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<PaginatedResponse<CreditNote>>({
    queryKey: [QUERY_KEYS.CREDIT_NOTES, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.CREDIT_NOTE(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch credit notes");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useCreditNoteById(id: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<CreditNote>({
    queryKey: [QUERY_KEYS.CREDIT_NOTES, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.CREDIT_NOTE(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch credit note");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreateCreditNote() {
  return useApiMutation<CreateCnDto>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.CREDIT_NOTE(buCode), data),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTES],
    errorMessage: "Failed to create credit note",
  });
}

export function useUpdateCreditNote() {
  return useApiMutation<CreateCnDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(`${API_ENDPOINTS.CREDIT_NOTE(buCode)}/${id}`, data),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTES],
    errorMessage: "Failed to update credit note",
  });
}

export function useDeleteCreditNote() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.CREDIT_NOTE(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.CREDIT_NOTES],
    errorMessage: "Failed to delete credit note",
  });
}
