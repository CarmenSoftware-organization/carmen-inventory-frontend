import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileQueryKey } from "@/hooks/use-profile";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(API_ENDPOINTS.LOGOUT, { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: profileQueryKey });
      router.push("/login");
    },
  });
}
