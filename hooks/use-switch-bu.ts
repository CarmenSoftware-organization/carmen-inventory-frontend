import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileQueryKey } from "@/hooks/use-profile";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { httpClient } from "@/lib/http-client";
import { ApiError } from "@/lib/api-error";

export function useSwitchBu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (buId: string) => {
      const res = await httpClient.post(API_ENDPOINTS.SWITCH_BU, {
        tenant_id: buId,
      });

      if (!res.ok) throw ApiError.fromResponse(res, "Failed to switch business unit");

      return res.json();
    },
    onSuccess: () => {
      // Remove all BU-scoped cached data so it refetches lazily when needed
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== profileQueryKey[0],
      });
      // Immediately refetch profile to get new BU context
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });
}
