import {
  FileText,
  ShoppingCart,
  PackageCheck,
  ReceiptText,
} from "lucide-react";
import { type ChartConfig } from "@/components/ui/chart";

export const SUMMARY = [
  {
    label: "Purchase Requests",
    href: "/procurement/purchase-request",
    icon: FileText,
    total: 124,
    pending: 8,
    badge: "info-light" as const,
  },
  {
    label: "Purchase Orders",
    href: "/procurement/purchase-order",
    icon: ShoppingCart,
    total: 89,
    pending: 5,
    badge: "warning-light" as const,
  },
  {
    label: "Goods Receive",
    href: "/procurement/goods-receive-note",
    icon: PackageCheck,
    total: 67,
    pending: 3,
    badge: "success-light" as const,
  },
  {
    label: "Credit Notes",
    href: "/procurement/credit-note",
    icon: ReceiptText,
    total: 12,
    pending: 1,
    badge: "destructive-light" as const,
  },
];

export const MONTHLY_DATA = [
  { month: "Sep", po: 18, grn: 14 },
  { month: "Oct", po: 24, grn: 20 },
  { month: "Nov", po: 15, grn: 13 },
  { month: "Dec", po: 28, grn: 22 },
  { month: "Jan", po: 22, grn: 19 },
  { month: "Feb", po: 12, grn: 8 },
];

export const CHART_CONFIG: ChartConfig = {
  po: { label: "PO", color: "var(--chart-1)" },
  grn: { label: "GRN", color: "var(--chart-2)" },
};

export const RECENT_ITEMS = [
  {
    id: "PR-2025-0132",
    type: "PR",
    status: "Pending Approval",
    date: "2025-02-25",
    amount: 45200,
  },
  {
    id: "PO-2025-0089",
    type: "PO",
    status: "Approved",
    date: "2025-02-24",
    amount: 128500,
  },
  {
    id: "GRN-2025-0067",
    type: "GRN",
    status: "Pending Confirm",
    date: "2025-02-24",
    amount: 89300,
  },
  {
    id: "PO-2025-0088",
    type: "PO",
    status: "Draft",
    date: "2025-02-23",
    amount: 67800,
  },
  {
    id: "CN-2025-0012",
    type: "CN",
    status: "Open",
    date: "2025-02-23",
    amount: 15400,
  },
  {
    id: "PR-2025-0131",
    type: "PR",
    status: "Approved",
    date: "2025-02-22",
    amount: 32100,
  },
];

export const STATUS_VARIANT: Record<
  string,
  "info-light" | "success-light" | "warning-light" | "destructive-light"
> = {
  "Pending Approval": "warning-light",
  Approved: "success-light",
  "Pending Confirm": "info-light",
  Draft: "info-light",
  Open: "destructive-light",
};

export const TYPE_HREF: Record<string, string> = {
  PR: "/procurement/purchase-request",
  PO: "/procurement/purchase-order",
  GRN: "/procurement/goods-receive-note",
  CN: "/procurement/credit-note",
};

export const PENDING_APPROVALS = [
  {
    id: "PR-2025-0132",
    type: "PR",
    requester: "Somchai K.",
    department: "Kitchen",
    amount: 45200,
    date: "2025-02-25",
  },
  {
    id: "PR-2025-0130",
    type: "PR",
    requester: "Nattaya S.",
    department: "Bakery",
    amount: 18900,
    date: "2025-02-25",
  },
  {
    id: "PO-2025-0090",
    type: "PO",
    requester: "Wipawee T.",
    department: "Procurement",
    amount: 256000,
    date: "2025-02-24",
  },
  {
    id: "PR-2025-0128",
    type: "PR",
    requester: "Piyarat M.",
    department: "F&B",
    amount: 12400,
    date: "2025-02-24",
  },
];

export const TOP_VENDORS = [
  { name: "Fresh Produce Co.", amount: 485000, orders: 24 },
  { name: "Thai Seafood Ltd.", amount: 328000, orders: 18 },
  { name: "Metro Wholesale", amount: 275000, orders: 32 },
  { name: "Bangkok Dairy", amount: 198000, orders: 15 },
  { name: "Green Valley Farm", amount: 142000, orders: 11 },
];

export const TOP_VENDOR_MAX = Math.max(...TOP_VENDORS.map((v) => v.amount));

export const UPCOMING_DELIVERIES = [
  {
    po: "PO-2025-0089",
    vendor: "Fresh Produce Co.",
    items: 8,
    eta: "2025-02-26",
    status: "Today",
  },
  {
    po: "PO-2025-0087",
    vendor: "Thai Seafood Ltd.",
    items: 5,
    eta: "2025-02-27",
    status: "Tomorrow",
  },
  {
    po: "PO-2025-0085",
    vendor: "Metro Wholesale",
    items: 12,
    eta: "2025-02-28",
    status: "In 2 days",
  },
  {
    po: "PO-2025-0083",
    vendor: "Bangkok Dairy",
    items: 4,
    eta: "2025-03-01",
    status: "In 3 days",
  },
];

export const PO_STATUS_DATA = [
  { name: "Draft", value: 12, fill: "var(--chart-3)" },
  { name: "Approved", value: 45, fill: "var(--chart-2)" },
  { name: "Pending", value: 18, fill: "var(--chart-1)" },
  { name: "Closed", value: 14, fill: "var(--chart-4)" },
];

export const PO_STATUS_CONFIG: ChartConfig = {
  Draft: { label: "Draft", color: "var(--chart-3)" },
  Approved: { label: "Approved", color: "var(--chart-2)" },
  Pending: { label: "Pending", color: "var(--chart-1)" },
  Closed: { label: "Closed", color: "var(--chart-4)" },
};
