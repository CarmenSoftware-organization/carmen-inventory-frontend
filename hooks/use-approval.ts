import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { buildUrl } from "@/utils/build-query-string";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { ApprovalItem, ApprovalPendingSummary } from "@/types/approval";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

/* eslint-disable @typescript-eslint/no-explicit-any */

function normalizePR(item: any): ApprovalItem {
  return {
    id: item.id,
    doc_type: "pr",
    doc_no: item.pr_no ?? "",
    doc_date: item.pr_date ?? "",
    description: item.description ?? "",
    status: item.pr_status ?? "",
    created_at: item.created_at ?? "",
    workflow_name: item.workflow_name ?? "",
    workflow_current_stage: item.workflow_current_stage ?? "",
    workflow_next_stage: item.workflow_next_stage ?? null,
    workflow_previous_stage: item.workflow_previous_stage ?? null,
    last_action: item.last_action ?? null,
    requestor_name: item.requestor_name ?? "",
    department_name: item.department_name ?? "",
    purchase_request_detail: item.purchase_request_detail ?? [],
    vendor_name: "",
    total_amount: 0,
    delivery_date: null,
  };
}

function normalizePO(item: any): ApprovalItem {
  return {
    id: item.id,
    doc_type: "po",
    doc_no: item.po_no ?? "",
    doc_date: item.order_date ?? "",
    description: item.description ?? "",
    status: item.po_status ?? item.status ?? "",
    created_at: item.created_at ?? "",
    workflow_name: item.workflow_name ?? "",
    workflow_current_stage: item.workflow_current_stage ?? "",
    workflow_next_stage: item.workflow_next_stage ?? null,
    workflow_previous_stage: item.workflow_previous_stage ?? null,
    last_action: item.last_action ?? null,
    requestor_name: "",
    department_name: "",
    purchase_request_detail: [],
    vendor_name: item.vendor_name ?? "",
    total_amount: item.total_amount ?? 0,
    delivery_date: item.delivery_date ?? null,
  };
}

function normalizeSR(item: any): ApprovalItem {
  return {
    id: item.id,
    doc_type: "sr",
    doc_no: item.sr_no ?? "",
    doc_date: item.sr_date ?? "",
    description: item.description ?? "",
    status: item.sr_status ?? item.status ?? "",
    created_at: item.created_at ?? "",
    workflow_name: item.workflow_name ?? "",
    workflow_current_stage: item.workflow_current_stage ?? "",
    workflow_next_stage: item.workflow_next_stage ?? null,
    workflow_previous_stage: item.workflow_previous_stage ?? null,
    last_action: item.last_action ?? null,
    requestor_name: item.requestor_name ?? "",
    department_name: item.department_name ?? "",
    purchase_request_detail: [],
    vendor_name: "",
    total_amount: 0,
    delivery_date: null,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

function extractSection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entries: any[] | undefined,
  normalize: (item: any) => ApprovalItem, // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  const entry = entries?.[0];
  const items: ApprovalItem[] = (entry?.data ?? []).map(normalize);
  const total: number = entry?.paginate?.total ?? 0;
  return { items, total };
}

export function useApprovalPending(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<PaginatedResponse<ApprovalItem>>({
    queryKey: [QUERY_KEYS.APPROVAL_PENDING, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.APPROVAL_PENDING, {
        bu_code: buCode,
        ...params,
      });
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch pending approvals");
      const json = await res.json();
      const root = json.data;

      const pr = extractSection(root?.purchase_requests, normalizePR);
      const po = extractSection(root?.purchase_orders, normalizePO);
      const sr = extractSection(root?.store_requisitions, normalizeSR);

      const allItems = [...pr.items, ...po.items, ...sr.items];
      const totalRecords = pr.total + po.total + sr.total;

      return {
        data: allItems,
        paginate: {
          total: totalRecords,
          page: Number(params?.page) || 1,
          perpage: Number(params?.perpage) || 10,
          pages: Math.ceil(totalRecords / (Number(params?.perpage) || 10)),
        },
      };
    },
    enabled: !!buCode,
  });
}

export function useApprovalPendingSummary() {
  return useQuery<ApprovalPendingSummary>({
    queryKey: [QUERY_KEYS.APPROVAL_PENDING_SUMMARY],
    queryFn: async () => {
      const res = await httpClient.get(API_ENDPOINTS.APPROVAL_PENDING_SUMMARY);
      if (!res.ok) throw new Error("Failed to fetch approval summary");
      const json = await res.json();
      return json.data;
    },
  });
}
