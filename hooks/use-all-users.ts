import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { User } from "@/types/workflows";
import { CACHE_NORMAL } from "@/lib/cache-config";
import { getAllUsers } from "@/lib/api/users";

export function useAllUsers() {
  const buCode = useBuCode();

  return useQuery<User[]>({
    queryKey: [QUERY_KEYS.USERS, buCode, "all"],
    queryFn: () => getAllUsers(buCode!),
    enabled: !!buCode,
    ...CACHE_NORMAL,
  });
}
