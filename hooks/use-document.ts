import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { DocumentFile } from "@/types/document";
import type { PaginatedResponse, ParamsDto } from "@/types/params";

export function useDocument(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<PaginatedResponse<DocumentFile>>({
    queryKey: [QUERY_KEYS.DOCUMENTS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.DOCUMENTS(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useUploadDocument() {
  const { buCode } = useProfile();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, File>({
    mutationFn: async (file) => {
      if (!buCode) throw new Error("Missing buCode");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_ENDPOINTS.DOCUMENTS(buCode)}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to upload document");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
    },
  });
}

export function useDeleteDocument() {
  return useApiMutation<string>({
    mutationFn: (fileToken, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.DOCUMENTS(buCode)}/${fileToken}`),
    invalidateKeys: [QUERY_KEYS.DOCUMENTS],
    errorMessage: "Failed to delete document",
  });
}
