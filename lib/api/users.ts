import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type { User } from "@/types/workflows";
import type { PaginatedResponse } from "@/types/params";

export async function getAllUsers(buCode: string): Promise<User[]> {
  const url = buildUrl(API_ENDPOINTS.USERS(buCode), { perpage: -1 });
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch users");
  const json: PaginatedResponse<User> = await res.json();
  return json.data;
}
