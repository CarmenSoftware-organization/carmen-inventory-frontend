import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { buildUrl } from "@/utils/build-query-string";
import type { Location } from "@/types/location";
import type { ParamsDto } from "@/types/params";
import { API_ENDPOINTS } from "@/constant/api-endpoints";

interface LocationResponse {
  data: Location[];
  paginate: {
    total: number;
    page: number;
    perpage: number;
    pages: number;
  };
}

export function useLocation(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<LocationResponse>({
    queryKey: ["locations", buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.LOCATIONS(buCode), params);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useLocationById(id: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<Location>({
    queryKey: ["locations", buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await fetch(`${API_ENDPOINTS.LOCATIONS(buCode)}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch location");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export interface CreateLocationDto {
  code: string;
  name: string;
  location_type: string;
  physical_count_type: string;
  description: string;
  is_active: boolean;
}

export function useCreateLocation() {
  return useApiMutation<CreateLocationDto>({
    mutationFn: (data, buCode) =>
      fetch(API_ENDPOINTS.LOCATIONS(buCode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["locations"],
    errorMessage: "Failed to create location",
  });
}

export function useDeleteLocation() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      fetch(`${API_ENDPOINTS.LOCATIONS(buCode)}/${id}`, {
        method: "DELETE",
      }),
    invalidateKeys: ["locations"],
    errorMessage: "Failed to delete location",
  });
}

export function useUpdateLocation() {
  return useApiMutation<CreateLocationDto & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      fetch(`${API_ENDPOINTS.LOCATIONS(buCode)}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    invalidateKeys: ["locations"],
    errorMessage: "Failed to update location",
  });
}
