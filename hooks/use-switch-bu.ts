import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileQueryKey } from "@/hooks/use-profile";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

export function useSwitchBu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (buId: string) => {
      const res = await fetch(API_ENDPOINTS.SWITCH_BU, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: buId }),
      });

      if (!res.ok) throw new Error("Failed to switch business unit");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
