import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type {
  ChangePasswordDto,
  UpdateProfileDto,
  UserProfile,
} from "@/types/profile";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import { ApiError } from "@/lib/api-error";
import { httpClient } from "@/lib/http-client";

export const profileQueryKey = [QUERY_KEYS.PROFILE] as const;

export function useProfile() {
  const router = useRouter();

  const query = useQuery<UserProfile>({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const res = await httpClient.get(API_ENDPOINTS.PROFILE);

      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch profile");

      const json = await res.json();
      return json.data;
    },
    staleTime: Infinity,
    retry: (_, error) =>
      !(error instanceof Error && error.message === "Unauthorized"),
  });

  useEffect(() => {
    if (query.error?.message === "Unauthorized") {
      router.push("/login");
    }
  }, [query.error, router]);

  const defaultBu = useMemo(
    () =>
      query.data?.business_unit.find((b) => b.is_default) ??
      query.data?.business_unit[0],
    [query.data],
  );

  const userId = query.data?.id;
  const aliasName = query.data?.alias_name;
  const buCode = defaultBu?.code;

  const defaultCurrencyId = defaultBu?.config?.default_currency_id;
  const defaultCurrencyCode = defaultBu?.config?.default_currency?.code;
  const defaultCurrencyDecimalPlaces =
    defaultBu?.config?.default_currency?.decimal_places;
  const dateFormat = defaultBu?.config?.date_format ?? "DD/MM/YYYY";

  const allBuCode = useMemo(
    () => query.data?.business_unit.map((b) => b.code),
    [query.data],
  );
  const hasDepartment = defaultBu?.department != null;

  return {
    ...query,
    defaultBu,
    buCode,
    defaultCurrencyId,
    defaultCurrencyCode,
    defaultCurrencyDecimalPlaces,
    dateFormat,
    allBuCode,
    userId,
    hasDepartment,
    aliasName,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, UpdateProfileDto>({
    mutationFn: async (data) => {
      const res = await httpClient.patch(API_ENDPOINTS.PROFILE_UPDATE, data);
      if (!res.ok) {
        let serverMessage: string | undefined;
        try {
          const err = await res.json();
          serverMessage = err.message;
        } catch {
          // JSON parse failed
        }
        throw ApiError.fromResponse(
          res,
          serverMessage || "Failed to update profile",
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}

export function useChangePassword() {
  return useMutation<unknown, ApiError, ChangePasswordDto>({
    mutationFn: async (data) => {
      const res = await httpClient.post(
        API_ENDPOINTS.PROFILE_CHANGE_PASSWORD,
        data,
      );
      if (!res.ok) {
        let serverMessage: string | undefined;
        try {
          const err = await res.json();
          serverMessage = err.message;
        } catch {
          // JSON parse failed
        }
        throw ApiError.fromResponse(
          res,
          serverMessage || "Failed to change password",
        );
      }
      return res.json();
    },
  });
}
