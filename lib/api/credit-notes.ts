import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { CreditNote, CreateCnDto } from "@/types/credit-note";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getCreditNotes(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<CreditNote>> {
  const url = buildUrl(API_ENDPOINTS.CREDIT_NOTE(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch credit notes");
  return res.json();
}

export async function getCreditNoteById(
  buCode: string,
  id: string,
): Promise<CreditNote> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.CREDIT_NOTE(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch credit note");
  const json = await res.json();
  return json.data;
}

export async function createCreditNote(
  buCode: string,
  data: CreateCnDto,
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.CREDIT_NOTE(buCode), data);
}

export async function updateCreditNote(
  buCode: string,
  id: string,
  data: CreateCnDto,
): Promise<Response> {
  return httpClient.put(`${API_ENDPOINTS.CREDIT_NOTE(buCode)}/${id}`, data);
}

export async function deleteCreditNote(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(`${API_ENDPOINTS.CREDIT_NOTE(buCode)}/${id}`);
}
