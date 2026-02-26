import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import { ApiError, ERROR_CODES } from "@/lib/api-error";
import type { DocumentFile } from "@/types/document";
import type { PaginatedResponse, ParamsDto } from "@/types/params";
import { CACHE_DYNAMIC } from "@/lib/cache-config";

export function useDocument(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<DocumentFile>>({
    queryKey: [QUERY_KEYS.DOCUMENTS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new ApiError(ERROR_CODES.MISSING_REQUIRED_FIELD, "Missing buCode");
      const url = buildUrl(API_ENDPOINTS.DOCUMENTS(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw ApiError.fromResponse(res, "Failed to fetch documents");
      return res.json();
    },
    enabled: !!buCode,
    ...CACHE_DYNAMIC,
  });
}

export function useUploadDocument() {
  const buCode = useBuCode();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, File>({
    mutationFn: async (file) => {
      if (!buCode) throw new ApiError(ERROR_CODES.MISSING_REQUIRED_FIELD, "Missing buCode");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_ENDPOINTS.DOCUMENTS(buCode)}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApiError(ERROR_CODES.INTERNAL_ERROR, err.message || "Failed to upload document");
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
