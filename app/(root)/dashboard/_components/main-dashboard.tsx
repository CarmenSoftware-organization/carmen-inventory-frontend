"use client";

import { useState } from "react";
import Link from "next/link";
import {
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
} from "@/components/ui/chart";
import {
  CHART_CONFIG,
  MONTHLY_DATA,
  PENDING_APPROVALS,
  PO_STATUS_CONFIG,
  PO_STATUS_DATA,
  RECENT_ITEMS,
  STATUS_VARIANT,
  SUMMARY,
  TOP_VENDOR_MAX,
  TOP_VENDORS,
  TYPE_HREF,
  UPCOMING_DELIVERIES,
} from "./dashboard-mock-data";

// --- Mock Data ---

const ETA_VARIANT: Record<
  string,
  "destructive-light" | "warning-light" | "info-light"
> = {
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
        <h2 className="text-sm font-semibold border-b pb-2">Procurement Overview</h2>
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
            <h2 className="text-sm font-semibold border-b pb-2">Monthly Trend</h2>
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
            <h2 className="text-sm font-semibold border-b pb-2">Recent Activity</h2>
            <Clock className="size-3 text-muted-foreground" />
          </div>
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Document
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Amount
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ITEMS.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 hover:bg-accent/50"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={TYPE_HREF[item.type] ?? "#"}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={STATUS_VARIANT[item.status] ?? "outline"}
                        size="xs"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatAmount(item.amount)}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {item.date}
                    </td>
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
            <h2 className="text-sm font-semibold border-b pb-2">Pending My Approval</h2>
            <AlertCircle className="size-3 text-muted-foreground" />
            <Badge variant="warning-light" size="xs">
              {PENDING_APPROVALS.length}
            </Badge>
          </div>
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Document
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Requester
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Department
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Amount
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {PENDING_APPROVALS.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 hover:bg-accent/50"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={TYPE_HREF[item.type] ?? "#"}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{item.requester}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {item.department}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatAmount(item.amount)}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PO Status Donut */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold border-b pb-2">PO by Status</h2>
          <div className="rounded-md border p-3">
            <ChartContainer
              config={PO_STATUS_CONFIG}
              className="mx-auto h-36 w-36"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={PO_STATUS_DATA}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={36}
                  outerRadius={60}
                  strokeWidth={2}
                >
                  {PO_STATUS_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {PO_STATUS_DATA.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-1.5 text-[11px]"
                >
                  <span
                    className="size-2 shrink-0 rounded-sm"
                    style={{ background: s.fill }}
                  />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto tabular-nums font-medium">
                    {s.value}
                  </span>
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
            <h2 className="text-sm font-semibold border-b pb-2">Top Vendors</h2>
            <Building2 className="size-3 text-muted-foreground" />
          </div>
          <div className="rounded-md border p-3 space-y-2.5">
            {TOP_VENDORS.map((v) => (
              <div key={v.name} className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="truncate font-medium">{v.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground ml-2">
                    {formatAmount(v.amount)}{" "}
                    <span className="text-[10px]">({v.orders} POs)</span>
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
            <h2 className="text-sm font-semibold border-b pb-2">Upcoming Deliveries</h2>
            <Truck className="size-3 text-muted-foreground" />
          </div>
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    PO
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Vendor
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Items
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    ETA
                  </th>
                </tr>
              </thead>
              <tbody>
                {UPCOMING_DELIVERIES.map((d) => (
                  <tr
                    key={d.po}
                    className="border-b last:border-b-0 hover:bg-accent/50"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href="/procurement/purchase-order"
                        className="font-medium text-primary hover:underline"
                      >
                        {d.po}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{d.vendor}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {d.items}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Badge
                        variant={ETA_VARIANT[d.status] ?? "info-light"}
                        size="xs"
                      >
                        {d.status}
                      </Badge>
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
