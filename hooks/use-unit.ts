import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { buildUrl } from "@/utils/build-query-string";
import type { Unit } from "@/types/unit";
import type { ParamsDto } from "@/types/params";

interface UnitResponse {
  data: Unit[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useUnit(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<UnitResponse>({
    queryKey: ["units", buCode, params],
    queryFn: async () => {
      const url = buildUrl(`/api/proxy/api/config/${buCode}/units`, params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch units");
      return res.json();
    },
    enabled: !!buCode,
  });
}
