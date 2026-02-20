import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { ExchangeRateItem, ExchangeRateDto } from "@/types/exchange-rate";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getExchangeRates(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<ExchangeRateItem>> {
  const url = buildUrl(API_ENDPOINTS.EXCHANGE_RATES(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch exchange rates");
  return res.json();
}

export async function createExchangeRates(
  buCode: string,
  data: ExchangeRateDto[],
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.EXCHANGE_RATES(buCode), data);
}

export async function updateExchangeRate(
  buCode: string,
  id: string,
  data: { exchange_rate: number },
): Promise<Response> {
  return httpClient.patch(
    `${API_ENDPOINTS.EXCHANGE_RATES(buCode)}/${id}`,
    data,
  );
}

interface ExternalRateResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
  time_last_update_utc: string;
}

export async function getExternalExchangeRates(
  baseCurrency: string,
): Promise<Record<string, number>> {
  const res = await fetch(
    `/api/exchange-rate?base=${encodeURIComponent(baseCurrency)}`,
  );
  if (!res.ok)
    throw new Error(`Failed to fetch exchange rates: ${res.status}`);
  const data: ExternalRateResponse = await res.json();
  if (data.result !== "success")
    throw new Error("Exchange rate API returned an error");
  return data.conversion_rates;
}
