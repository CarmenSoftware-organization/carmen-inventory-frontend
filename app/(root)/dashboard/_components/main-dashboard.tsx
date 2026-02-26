"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShoppingCart,
  PackageCheck,
  ReceiptText,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
  Truck,
  Building2,
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, Cell, Pie, PieChart } from "recharts";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// --- Mock Data ---

const SUMMARY = [
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

const MONTHLY_DATA = [
  { month: "Sep", po: 18, grn: 14 },
  { month: "Oct", po: 24, grn: 20 },
  { month: "Nov", po: 15, grn: 13 },
  { month: "Dec", po: 28, grn: 22 },
  { month: "Jan", po: 22, grn: 19 },
  { month: "Feb", po: 12, grn: 8 },
];

const CHART_CONFIG: ChartConfig = {
  po: { label: "PO", color: "var(--chart-1)" },
  grn: { label: "GRN", color: "var(--chart-2)" },
};

const RECENT_ITEMS = [
  { id: "PR-2025-0132", type: "PR", status: "Pending Approval", date: "2025-02-25", amount: 45200 },
  { id: "PO-2025-0089", type: "PO", status: "Approved", date: "2025-02-24", amount: 128500 },
  { id: "GRN-2025-0067", type: "GRN", status: "Pending Confirm", date: "2025-02-24", amount: 89300 },
  { id: "PO-2025-0088", type: "PO", status: "Draft", date: "2025-02-23", amount: 67800 },
  { id: "CN-2025-0012", type: "CN", status: "Open", date: "2025-02-23", amount: 15400 },
  { id: "PR-2025-0131", type: "PR", status: "Approved", date: "2025-02-22", amount: 32100 },
];

const STATUS_VARIANT: Record<string, "info-light" | "success-light" | "warning-light" | "destructive-light"> = {
  "Pending Approval": "warning-light",
  Approved: "success-light",
  "Pending Confirm": "info-light",
  Draft: "info-light",
  Open: "destructive-light",
};

const TYPE_HREF: Record<string, string> = {
  PR: "/procurement/purchase-request",
  PO: "/procurement/purchase-order",
  GRN: "/procurement/goods-receive-note",
  CN: "/procurement/credit-note",
};

const PENDING_APPROVALS = [
  { id: "PR-2025-0132", type: "PR", requester: "Somchai K.", department: "Kitchen", amount: 45200, date: "2025-02-25" },
  { id: "PR-2025-0130", type: "PR", requester: "Nattaya S.", department: "Bakery", amount: 18900, date: "2025-02-25" },
  { id: "PO-2025-0090", type: "PO", requester: "Wipawee T.", department: "Procurement", amount: 256000, date: "2025-02-24" },
  { id: "PR-2025-0128", type: "PR", requester: "Piyarat M.", department: "F&B", amount: 12400, date: "2025-02-24" },
];

const TOP_VENDORS = [
  { name: "Fresh Produce Co.", amount: 485000, orders: 24 },
  { name: "Thai Seafood Ltd.", amount: 328000, orders: 18 },
  { name: "Metro Wholesale", amount: 275000, orders: 32 },
  { name: "Bangkok Dairy", amount: 198000, orders: 15 },
  { name: "Green Valley Farm", amount: 142000, orders: 11 },
];

const TOP_VENDOR_MAX = Math.max(...TOP_VENDORS.map((v) => v.amount));

const UPCOMING_DELIVERIES = [
  { po: "PO-2025-0089", vendor: "Fresh Produce Co.", items: 8, eta: "2025-02-26", status: "Today" },
  { po: "PO-2025-0087", vendor: "Thai Seafood Ltd.", items: 5, eta: "2025-02-27", status: "Tomorrow" },
  { po: "PO-2025-0085", vendor: "Metro Wholesale", items: 12, eta: "2025-02-28", status: "In 2 days" },
  { po: "PO-2025-0083", vendor: "Bangkok Dairy", items: 4, eta: "2025-03-01", status: "In 3 days" },
];

const PO_STATUS_DATA = [
  { name: "Draft", value: 12, fill: "var(--chart-3)" },
  { name: "Approved", value: 45, fill: "var(--chart-2)" },
  { name: "Pending", value: 18, fill: "var(--chart-1)" },
  { name: "Closed", value: 14, fill: "var(--chart-4)" },
];

const PO_STATUS_CONFIG: ChartConfig = {
  Draft: { label: "Draft", color: "var(--chart-3)" },
  Approved: { label: "Approved", color: "var(--chart-2)" },
  Pending: { label: "Pending", color: "var(--chart-1)" },
  Closed: { label: "Closed", color: "var(--chart-4)" },
};

const ETA_VARIANT: Record<string, "destructive-light" | "warning-light" | "info-light"> = {
  Today: "destructive-light",
  Tomorrow: "warning-light",
};

// --- Helpers ---

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const formatAmount = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0 });

// --- Component ---

export default function MainDashboard() {
  const [greeting] = useState(getGreeting);

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    defaultBu,
  } = useProfile();

  if (isError) {
    return (
      <ErrorState
        message="Unable to connect to server"
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading)
    return (
      <div className="space-y-4 p-3">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );

  const name = profile
    ? `${profile.user_info.firstname} ${profile.user_info.lastname}`
    : "User";

  return (
    <div className="space-y-4 p-3">
      {/* ── Header ── */}
      <section>
        <h1 className="text-lg font-semibold">
          {greeting}, {name}
        </h1>
        {defaultBu && (
          <p className="text-xs text-muted-foreground">
            {defaultBu.name}
            {defaultBu.department?.name && ` · ${defaultBu.department.name}`}
          </p>
        )}
      </section>

      {/* ── Summary ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold">Procurement Overview</h2>
        <div className="grid grid-cols-4 gap-3">
          {SUMMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <item.icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-xs text-muted-foreground">
                  {item.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold tabular-nums">
                    {item.total}
                  </span>
                  {item.pending > 0 && (
                    <Badge variant={item.badge} size="xs">
                      {item.pending} pending
                    </Badge>
                  )}
                </div>
              </div>
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Row 2: Charts + Recent ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold">Monthly Trend</h2>
            <TrendingUp className="size-3 text-muted-foreground" />
          </div>
          <div className="rounded-md border p-3">
            <ChartContainer config={CHART_CONFIG} className="h-48 w-full">
              <BarChart data={MONTHLY_DATA} barGap={2}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={28}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="po"
                  fill="var(--color-po)"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="grn"
                  fill="var(--color-grn)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold">Recent Activity</h2>
            <Clock className="size-3 text-muted-foreground" />
          </div>
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th scope="col" className="px-3 py-2 text-left font-medium">Document</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Status</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Amount</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ITEMS.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0 hover:bg-accent/50">
                    <td className="px-3 py-2">
                      <Link href={TYPE_HREF[item.type] ?? "#"} className="font-medium text-primary hover:underline">
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={STATUS_VARIANT[item.status] ?? "outline"} size="xs">{item.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatAmount(item.amount)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Row 3: Pending Approvals + PO Status Donut ── */}
      <div className="grid grid-cols-[1fr_18rem] gap-4">
        {/* Pending Approvals */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold">Pending My Approval</h2>
            <AlertCircle className="size-3 text-muted-foreground" />
            <Badge variant="warning-light" size="xs">{PENDING_APPROVALS.length}</Badge>
          </div>
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th scope="col" className="px-3 py-2 text-left font-medium">Document</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Requester</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Department</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Amount</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {PENDING_APPROVALS.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0 hover:bg-accent/50">
                    <td className="px-3 py-2">
                      <Link href={TYPE_HREF[item.type] ?? "#"} className="font-medium text-primary hover:underline">
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{item.requester}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.department}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatAmount(item.amount)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PO Status Donut */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold">PO by Status</h2>
          <div className="rounded-md border p-3">
            <ChartContainer config={PO_STATUS_CONFIG} className="mx-auto h-36 w-36">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={PO_STATUS_DATA} dataKey="value" nameKey="name" innerRadius={36} outerRadius={60} strokeWidth={2}>
                  {PO_STATUS_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {PO_STATUS_DATA.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="size-2 shrink-0 rounded-sm" style={{ background: s.fill }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto tabular-nums font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Row 4: Top Vendors + Upcoming Deliveries ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Vendors */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold">Top Vendors</h2>
            <Building2 className="size-3 text-muted-foreground" />
          </div>
          <div className="rounded-md border p-3 space-y-2.5">
            {TOP_VENDORS.map((v) => (
              <div key={v.name} className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="truncate font-medium">{v.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground ml-2">
                    {formatAmount(v.amount)} <span className="text-[10px]">({v.orders} POs)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-chart-1"
                    style={{ width: `${(v.amount / TOP_VENDOR_MAX) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Deliveries */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold">Upcoming Deliveries</h2>
            <Truck className="size-3 text-muted-foreground" />
          </div>
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th scope="col" className="px-3 py-2 text-left font-medium">PO</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Vendor</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Items</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">ETA</th>
                </tr>
              </thead>
              <tbody>
                {UPCOMING_DELIVERIES.map((d) => (
                  <tr key={d.po} className="border-b last:border-b-0 hover:bg-accent/50">
                    <td className="px-3 py-2">
                      <Link href="/procurement/purchase-order" className="font-medium text-primary hover:underline">
                        {d.po}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{d.vendor}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{d.items}</td>
                    <td className="px-3 py-2 text-right">
                      <Badge variant={ETA_VARIANT[d.status] ?? "info-light"} size="xs">{d.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
