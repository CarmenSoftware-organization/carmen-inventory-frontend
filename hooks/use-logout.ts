import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { httpClient } from "@/lib/http-client";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const redirectToLogin = () => {
    queryClient.clear();
    router.push("/login");
  };

  return useMutation({
    mutationFn: async () => {
      const res = await httpClient.post(API_ENDPOINTS.LOGOUT);
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: redirectToLogin,
    onError: redirectToLogin,
  });
}
