import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { ApiError } from "@/lib/api-error";

interface UseApiMutationOptions<TVariables> {
  mutationFn: (variables: TVariables, buCode: string) => Promise<Response>;
  invalidateKeys?: readonly unknown[];
  errorMessage?: string;
  optimistic?: {
    queryKey: readonly unknown[];
    updater: (old: unknown, variables: TVariables) => unknown;
  };
}

export function useApiMutation<TVariables, TResponse = unknown>({
  mutationFn,
  invalidateKeys,
  errorMessage = "Request failed",
  optimistic,
}: UseApiMutationOptions<TVariables>) {
  const buCode = useBuCode();
  const queryClient = useQueryClient();

  return useMutation<
    TResponse,
    ApiError,
    TVariables,
    { previous?: unknown }
  >({
    mutationFn: async (variables) => {
      if (!buCode)
        throw new ApiError("MISSING_REQUIRED_FIELD", "Missing buCode");
      const res = await mutationFn(variables, buCode);
      if (!res.ok) {
        let serverMessage: string | undefined;
        try {
          const err = await res.json();
          serverMessage = err.message;
        } catch {
          // JSON parse failed — use fallback
        }
        throw ApiError.fromResponse(res, serverMessage || errorMessage);
      }
      return res.json();
    },

    onMutate: optimistic
      ? async (variables) => {
          await queryClient.cancelQueries({ queryKey: optimistic.queryKey });
          const previous = queryClient.getQueryData(optimistic.queryKey);
          queryClient.setQueryData(optimistic.queryKey, (old: unknown) =>
            optimistic.updater(old, variables),
          );
          return { previous };
        }
      : undefined,

    onError: optimistic
      ? (_err, _vars, context) => {
          if (context?.previous !== undefined) {
            queryClient.setQueryData(optimistic.queryKey, context.previous);
          }
        }
      : undefined,

    onSettled: () => {
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: Array.isArray(key) ? key : [key],
        });
      });
    },
  });
}
