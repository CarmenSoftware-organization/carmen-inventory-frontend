import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileQueryKey } from "@/hooks/use-profile";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { httpClient } from "@/lib/http-client";
import { ApiError } from "@/lib/api-error";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const redirectToLogin = () => {
    queryClient.removeQueries({ queryKey: profileQueryKey });
    router.push("/login");
  };

  return useMutation({
    mutationFn: async () => {
      const res = await httpClient.post(API_ENDPOINTS.LOGOUT);
      if (!res.ok) throw ApiError.fromResponse(res, "Logout failed");
    },
    onSuccess: redirectToLogin,
    onError: redirectToLogin,
  });
}
