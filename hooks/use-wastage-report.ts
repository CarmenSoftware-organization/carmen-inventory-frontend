import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { WastageReport } from "@/types/wastage-reporting";
import type { ParamsDto, PaginatedResponse } from "@/types/params";
import { wrMockData } from "@/app/(root)/store-operation/wastage-reporting/_components/wr-mock-data";
import { useMutation } from "@tanstack/react-query";

// ── TODO: เปลี่ยนเป็น API จริงเมื่อ backend พร้อม ──

export interface WrDetailPayload {
  product_id: string;
  qty: number;
  unit_id: string;
  unit_cost: number;
}

export interface CreateWastageReportDto {
  date: string;
  location_id: string;
  reason: string;
  wastage_report_detail: {
    add?: WrDetailPayload[];
    update?: (WrDetailPayload & { id: string })[];
    remove?: { id: string }[];
  };
}

export function useWastageReport(params?: ParamsDto) {
  return useQuery<PaginatedResponse<WastageReport>>({
    queryKey: [QUERY_KEYS.WASTAGE_REPORTS, params],
    queryFn: async () => {
      // Mock: simulate API delay
      await new Promise((r) => setTimeout(r, 300));

      let filtered = [...wrMockData];

      // Search filter
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.wr_no.toLowerCase().includes(s) ||
            item.location_name.toLowerCase().includes(s) ||
            item.reason.toLowerCase().includes(s) ||
            item.reportor_name.toLowerCase().includes(s),
        );
      }

      // Status filter
      if (params?.filter) {
        const statusMatch = params.filter.match(/status\|string:(\w+)/);
        if (statusMatch) {
          filtered = filtered.filter(
            (item) => item.status === statusMatch[1],
          );
        }
      }

      const total = filtered.length;
      const page = Number(params?.page) || 1;
      const perpage = Number(params?.perpage) || 10;
      const start = (page - 1) * perpage;
      const paged = filtered.slice(start, start + perpage);

      return {
        data: paged,
        paginate: {
          total,
          page,
          perpage,
          pages: Math.ceil(total / perpage),
        },
      };
    },
  });
}

export function useWastageReportById(id: string | undefined) {
  return useQuery<WastageReport>({
    queryKey: [QUERY_KEYS.WASTAGE_REPORTS, id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const found = wrMockData.find((item) => item.id === id);
      if (!found) throw new Error("Wastage report not found");
      return found;
    },
    enabled: !!id,
  });
}

export function useCreateWastageReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_data: CreateWastageReportDto) => {
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WASTAGE_REPORTS],
      });
    },
  });
}

export function useUpdateWastageReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_data: CreateWastageReportDto & { id: string }) => {
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WASTAGE_REPORTS],
      });
    },
  });
}

export function useDeleteWastageReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: string) => {
      await new Promise((r) => setTimeout(r, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.WASTAGE_REPORTS],
      });
    },
  });
}
