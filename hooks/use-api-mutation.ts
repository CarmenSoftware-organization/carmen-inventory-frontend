import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";

interface UseApiMutationOptions<TVariables> {
  mutationFn: (variables: TVariables, buCode: string) => Promise<Response>;
  invalidateKeys?: string[];
  errorMessage?: string;
}

export function useApiMutation<TVariables, TResponse = unknown>({
  mutationFn,
  invalidateKeys,
  errorMessage = "Request failed",
}: UseApiMutationOptions<TVariables>) {
  const { buCode } = useProfile();
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TVariables>({
    mutationFn: async (variables) => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await mutationFn(variables, buCode);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || errorMessage);
      }
      return res.json();
    },
    onSuccess: () => {
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
}
