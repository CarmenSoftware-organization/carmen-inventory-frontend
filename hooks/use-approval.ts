import { useQuery } from "@tanstack/react-query";
// TODO: uncomment เมื่อ API พร้อมใช้งานจริง
// import { useProfile } from "@/hooks/use-profile";
// import { buildUrl } from "@/utils/build-query-string";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import type { ApprovalItem, ApprovalActionPayload } from "@/types/approval";
import type { PurchaseRequestDetail } from "@/types/purchase-request";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

// ─── TODO: ลบ mock data เมื่อ API พร้อมใช้งานจริง ───
function createMockDetail(
  overrides: Partial<PurchaseRequestDetail> & { id: string; product_name: string },
): PurchaseRequestDetail {
  return {
    purchase_request_id: "",
    sequence_no: 1,
    location_id: "loc-1",
    location_code: "WH-01",
    location_name: "Main Warehouse",
    delivery_point_id: "dp-1",
    delivery_point_name: "Building A",
    delivery_date: null,
    product_id: "prod-1",
    product_local_name: null,
    inventory_unit_id: "unit-1",
    inventory_unit_name: "EA",
    description: null,
    comment: null,
    vendor_id: null,
    vendor_name: null,
    pricelist_detail_id: null,
    pricelist_no: null,
    pricelist_unit: null,
    pricelist_price: 0,
    pricelist_type: "",
    currency_id: "cur-1",
    currency_code: "THB",
    exchange_rate: 1,
    exchange_rate_date: null,
    requested_qty: 10,
    requested_unit_id: "unit-1",
    requested_unit_name: "EA",
    approved_qty: 0,
    approved_unit_id: "unit-1",
    approved_unit_name: "EA",
    foc_qty: 0,
    foc_unit_id: "unit-1",
    foc_unit_name: "EA",
    tax_profile_id: null,
    tax_profile_name: null,
    tax_rate: 0,
    tax_amount: 0,
    is_tax_adjustment: false,
    discount_rate: 0,
    discount_amount: 0,
    is_discount_adjustment: false,
    sub_total_price: 0,
    net_amount: 0,
    unit_price: 100,
    total_price: 1000,
    state_status: "pending",
    state_message: null,
    current_stage_status: "pending",
    info: {},
    dimension: [],
    doc_version: 1,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
    ...overrides,
  };
}

const MOCK_ITEMS: ApprovalItem[] = [
  {
    id: "mock-1",
    pr_no: "PR-2026-0001",
    pr_status: "submitted",
    pr_date: "2026-02-10",
    expected_date: "2026-03-01",
    description: "Office supplies for Q1",
    doc_status: "submitted",
    role: "approve",
    workflow_id: "wf-1",
    workflow_name: "General",
    workflow_current_stage: "Manager Approval",
    workflow_next_stage: "Director Approval",
    workflow_previous_stage: "Submitted",
    workflow_history: [
      { user: { id: "u-1", name: "John Doe" }, action: "submitted", datetime: {}, next_stage: "Manager Approval" },
    ],
    requestor_id: "u-1",
    requestor_name: "John Doe",
    department_id: "dep-1",
    department_code: "IT",
    department_name: "IT Department",
    vendor_id: "",
    vendor_code: "",
    vendor_name: "",
    purchase_request_detail: [
      createMockDetail({ id: "d-1", product_name: "A4 Paper", requested_qty: 50, unit_price: 120, total_price: 6000, pricelist_price: 120 }),
      createMockDetail({ id: "d-2", product_name: "Printer Ink", requested_qty: 10, unit_price: 450, total_price: 4500, pricelist_price: 450 }),
    ],
    info: {},
    dimension: "",
    doc_version: 1,
    created_at: "2026-02-10T08:00:00Z",
    updated_at: "2026-02-10T08:00:00Z",
  },
  {
    id: "mock-2",
    pr_no: "PR-2026-0002",
    pr_status: "in_progress",
    pr_date: "2026-02-12",
    expected_date: "2026-03-05",
    description: "Kitchen equipment maintenance",
    doc_status: "in_progress",
    role: "approve",
    workflow_id: "wf-2",
    workflow_name: "Maintenance",
    workflow_current_stage: "Budget Review",
    workflow_next_stage: "Final Approval",
    workflow_previous_stage: "Submitted",
    workflow_history: [
      { user: { id: "u-2", name: "Jane Smith" }, action: "submitted", datetime: {}, next_stage: "Budget Review" },
    ],
    requestor_id: "u-2",
    requestor_name: "Jane Smith",
    department_id: "dep-2",
    department_code: "FB",
    department_name: "F&B",
    vendor_id: "",
    vendor_code: "",
    vendor_name: "",
    purchase_request_detail: [
      createMockDetail({ id: "d-3", product_name: "Dishwasher Parts", requested_qty: 2, unit_price: 8500, total_price: 17000, pricelist_price: 8500 }),
    ],
    info: {},
    dimension: "",
    doc_version: 1,
    created_at: "2026-02-12T09:30:00Z",
    updated_at: "2026-02-12T09:30:00Z",
  },
  {
    id: "mock-3",
    pr_no: "PR-2026-0003",
    pr_status: "submitted",
    pr_date: "2026-02-14",
    expected_date: "2026-03-10",
    description: "New laptop for dev team",
    doc_status: "submitted",
    role: "approve",
    workflow_id: "wf-1",
    workflow_name: "General",
    workflow_current_stage: "Manager Approval",
    workflow_next_stage: "Procurement",
    workflow_previous_stage: "Submitted",
    workflow_history: [
      { user: { id: "u-3", name: "Mike Johnson" }, action: "submitted", datetime: {}, next_stage: "Manager Approval" },
    ],
    requestor_id: "u-3",
    requestor_name: "Mike Johnson",
    department_id: "dep-1",
    department_code: "IT",
    department_name: "IT Department",
    vendor_id: "",
    vendor_code: "",
    vendor_name: "",
    purchase_request_detail: [
      createMockDetail({ id: "d-4", product_name: 'MacBook Pro 14"', requested_qty: 3, unit_price: 65000, total_price: 195000, pricelist_price: 65000 }),
      createMockDetail({ id: "d-5", product_name: "USB-C Hub", requested_qty: 3, unit_price: 1500, total_price: 4500, pricelist_price: 1500 }),
      createMockDetail({ id: "d-6", product_name: "Monitor 27\"", requested_qty: 3, unit_price: 12000, total_price: 36000, pricelist_price: 12000 }),
    ],
    info: {},
    dimension: "",
    doc_version: 1,
    created_at: "2026-02-14T10:00:00Z",
    updated_at: "2026-02-14T10:00:00Z",
  },
  {
    id: "mock-4",
    pr_no: "PR-2026-0004",
    pr_status: "submitted",
    pr_date: "2026-02-15",
    expected_date: "2026-02-28",
    description: "Cleaning supplies restock",
    doc_status: "submitted",
    role: "approve",
    workflow_id: "wf-1",
    workflow_name: "General",
    workflow_current_stage: "Manager Approval",
    workflow_next_stage: "Procurement",
    workflow_previous_stage: "Submitted",
    workflow_history: [
      { user: { id: "u-4", name: "Sara Lee" }, action: "submitted", datetime: {}, next_stage: "Manager Approval" },
    ],
    requestor_id: "u-4",
    requestor_name: "Sara Lee",
    department_id: "dep-3",
    department_code: "HK",
    department_name: "Housekeeping",
    vendor_id: "",
    vendor_code: "",
    vendor_name: "",
    purchase_request_detail: [
      createMockDetail({ id: "d-7", product_name: "Floor Cleaner 5L", requested_qty: 20, unit_price: 250, total_price: 5000, pricelist_price: 250 }),
      createMockDetail({ id: "d-8", product_name: "Trash Bags (Pack)", requested_qty: 50, unit_price: 80, total_price: 4000, pricelist_price: 80 }),
    ],
    info: {},
    dimension: "",
    doc_version: 1,
    created_at: "2026-02-15T07:00:00Z",
    updated_at: "2026-02-15T07:00:00Z",
  },
  {
    id: "mock-5",
    pr_no: "PR-2026-0005",
    pr_status: "in_progress",
    pr_date: "2026-02-16",
    expected_date: "2026-03-15",
    description: "Conference room AV upgrade",
    doc_status: "in_progress",
    role: "approve",
    workflow_id: "wf-2",
    workflow_name: "Maintenance",
    workflow_current_stage: "Director Approval",
    workflow_next_stage: "Final Approval",
    workflow_previous_stage: "Budget Review",
    workflow_history: [
      { user: { id: "u-5", name: "Tom Wilson" }, action: "submitted", datetime: {}, next_stage: "Budget Review" },
      { user: { id: "u-6", name: "Admin" }, action: "approved", datetime: {}, next_stage: "Director Approval", current_stage: "Budget Review" },
    ],
    requestor_id: "u-5",
    requestor_name: "Tom Wilson",
    department_id: "dep-4",
    department_code: "ADM",
    department_name: "Administration",
    vendor_id: "",
    vendor_code: "",
    vendor_name: "",
    purchase_request_detail: [
      createMockDetail({ id: "d-9", product_name: "Projector 4K", requested_qty: 1, unit_price: 45000, total_price: 45000, pricelist_price: 45000 }),
      createMockDetail({ id: "d-10", product_name: "HDMI Cable 5m", requested_qty: 4, unit_price: 350, total_price: 1400, pricelist_price: 350 }),
    ],
    info: {},
    dimension: "",
    doc_version: 1,
    created_at: "2026-02-16T11:00:00Z",
    updated_at: "2026-02-16T14:00:00Z",
  },
];

function getMockPaginatedResponse(params?: ParamsDto): PaginatedResponse<ApprovalItem> {
  const page = Number(params?.page) || 1;
  const perpage = Number(params?.perpage) || 10;
  const search = params?.search?.toLowerCase();

  let filtered = MOCK_ITEMS;
  if (search) {
    filtered = MOCK_ITEMS.filter(
      (item) =>
        item.pr_no.toLowerCase().includes(search) ||
        item.requestor_name.toLowerCase().includes(search) ||
        item.department_name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * perpage;
  const data = filtered.slice(start, start + perpage);

  return {
    data,
    paginate: { total, page, perpage, pages: Math.ceil(total / perpage) },
  };
}
// ─── END mock data ───

export function useApprovalPending(params?: ParamsDto) {
  // TODO: ลบ mock data ด้านบน และ uncomment code ด้านล่างเมื่อ API พร้อมใช้งานจริง
  return useQuery<PaginatedResponse<ApprovalItem>>({
    queryKey: [QUERY_KEYS.APPROVAL_PENDING, params],
    queryFn: () => Promise.resolve(getMockPaginatedResponse(params)),
  });

  // const { buCode } = useProfile();
  //
  // return useQuery<PaginatedResponse<ApprovalItem>>({
  //   queryKey: [QUERY_KEYS.APPROVAL_PENDING, buCode, params],
  //   queryFn: async () => {
  //     if (!buCode) throw new Error("Missing buCode");
  //     const url = buildUrl(API_ENDPOINTS.APPROVAL_PENDING, {
  //       bu_code: buCode,
  //       ...params,
  //     });
  //     const res = await httpClient.get(url);
  //     if (!res.ok) throw new Error("Failed to fetch pending approvals");
  //     const json = await res.json();
  //     const entry = json.data?.[0];
  //     return {
  //       data: entry?.data ?? [],
  //       paginate: entry?.paginate ?? {
  //         total: 0,
  //         page: 1,
  //         perpage: 10,
  //         pages: 0,
  //       },
  //     };
  //   },
  //   enabled: !!buCode,
  // });
}

export function useApprovalById(id: string | undefined) {
  // TODO: ลบ mock data ด้านบน และ uncomment code ด้านล่างเมื่อ API พร้อมใช้งานจริง
  return useQuery<ApprovalItem>({
    queryKey: [QUERY_KEYS.APPROVAL_PENDING, id],
    queryFn: () => {
      const item = MOCK_ITEMS.find((i) => i.id === id);
      if (!item) throw new Error("Not found");
      return Promise.resolve(item);
    },
    enabled: !!id,
  });

  // const { buCode } = useProfile();
  //
  // return useQuery<ApprovalItem>({
  //   queryKey: [QUERY_KEYS.APPROVAL_PENDING, buCode, id],
  //   queryFn: async () => {
  //     if (!buCode) throw new Error("Missing buCode");
  //     const res = await httpClient.get(
  //       `${API_ENDPOINTS.APPROVAL_ACTION(buCode)}/${id}`,
  //     );
  //     if (!res.ok) throw new Error("Failed to fetch approval detail");
  //     const json = await res.json();
  //     return json.data;
  //   },
  //   enabled: !!buCode && !!id,
  // });
}

const APPROVAL_INVALIDATE_KEYS = [
  QUERY_KEYS.APPROVAL_PENDING,
  QUERY_KEYS.PURCHASE_REQUESTS,
  QUERY_KEYS.MY_PENDING_PURCHASE_REQUESTS,
];

export function useApproveAction() {
  return useApiMutation<ApprovalActionPayload>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.patch(
        `${API_ENDPOINTS.APPROVAL_ACTION(buCode)}/${id}/approve`,
        data,
      ),
    invalidateKeys: APPROVAL_INVALIDATE_KEYS,
    errorMessage: "Failed to approve",
  });
}

export function useRejectAction() {
  return useApiMutation<ApprovalActionPayload>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.patch(
        `${API_ENDPOINTS.APPROVAL_ACTION(buCode)}/${id}/reject`,
        data,
      ),
    invalidateKeys: APPROVAL_INVALIDATE_KEYS,
    errorMessage: "Failed to reject",
  });
}
