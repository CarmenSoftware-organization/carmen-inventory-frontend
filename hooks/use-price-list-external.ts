import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { PricelistExternalDto } from "../app/(external)/pl/[url_token]/_components/price-list-external.dto";

function buildPayload(formData: PricelistExternalDto) {
  return {
    products: formData.tb_pricelist_detail.map((item) => ({
      id: item.product_id,
      moqs: (item.moq_tiers || []).map((tier) => ({
        minQuantity: tier.minimum_quantity,
        unit: item.unit_name || "",
        price: tier.price,
        leadTimeDays: tier.lead_time_days ?? 0,
      })),
    })),
  };
}

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T = unknown>(
  res: Response,
  errorMessage: string,
): Promise<T> {
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new HttpError(json.message || errorMessage, res.status);
  }
  return res.json();
}

export function usePriceListExternal(urlToken: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRICE_LIST_EXTERNAL, urlToken],
    queryFn: async () => {
      const res = await httpClient.post(
        API_ENDPOINTS.PRICE_LIST_EXTERNAL_CHECK(urlToken),
      );
      const json = await handleResponse<{ data: PricelistExternalDto }>(
        res,
        "Failed to fetch price list",
      );
      return json.data;
    },
    enabled: !!urlToken,
    retry: (failureCount, error) => {
      if (error instanceof HttpError && error.status === 401) return false;
      return failureCount < 3;
    },
  });
}

export function useUpdatePriceListExternal(urlToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: PricelistExternalDto) => {
      const res = await httpClient.patch(
        API_ENDPOINTS.PRICE_LIST_EXTERNAL(urlToken),
        buildPayload(formData),
      );
      return handleResponse(res, "Failed to save changes");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRICE_LIST_EXTERNAL, urlToken],
      });
    },
  });
}

export function useSubmitPriceListExternal(urlToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: PricelistExternalDto) => {
      const res = await httpClient.post(
        `${API_ENDPOINTS.PRICE_LIST_EXTERNAL(urlToken)}/submit`,
        buildPayload(formData),
      );
      return handleResponse(res, "Failed to submit price list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRICE_LIST_EXTERNAL, urlToken],
      });
    },
  });
}
