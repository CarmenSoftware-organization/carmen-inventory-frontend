"use client";

import {
  ClipboardList,
  FileText,
  ShoppingCart,
  PackageOpen,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApprovalPending,
  useApprovalPendingSummary,
} from "@/hooks/use-approval";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import { useProfile } from "@/hooks/use-profile";
import SearchInput from "@/components/search-input";
import { ErrorState } from "@/components/ui/error-state";
import DisplayTemplate from "@/components/display-template";
import type { ApprovalPendingSummary } from "@/types/approval";
import ApprovalQueueList from "./approve-queue-list";

const SUMMARY_CARDS: {
  key: keyof ApprovalPendingSummary;
  label: string;
  icon: LucideIcon;
  color: string;
}[] = [
  { key: "total", label: "Total Pending", icon: ClipboardList, color: "primary" },
  { key: "pr", label: "Purchase Request", icon: FileText, color: "info" },
  { key: "po", label: "Purchase Order", icon: ShoppingCart, color: "warning" },
  { key: "sr", label: "Store Requisition", icon: PackageOpen, color: "secondary" },
];

export default function ApprovalComponent() {
  const { dateFormat } = useProfile();

  const { params, search, setSearch, tableConfig } = useDataGridState({
    defaultPerpage: 10,
  });

  const { data, isLoading, error, refetch } = useApprovalPending(params);
  const { data: summary, isLoading: summaryLoading } =
    useApprovalPendingSummary();

  const items = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Approval"
      description="Review and approve pending procurement requests."
      toolbar={<SearchInput defaultValue={search} onSearch={setSearch} />}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          return summaryLoading ? (
            <div
              key={card.key}
              className="rounded-lg border bg-card p-3 flex items-center gap-3"
            >
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>
          ) : (
            <div
              key={card.key}
              className="rounded-lg border bg-card p-3 flex items-center gap-3"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-lg bg-${card.color}/10`}
              >
                <Icon className={`size-4 text-${card.color}`} />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-none">
                  {card.label}
                </p>
                <p className="text-lg font-semibold leading-tight tabular-nums">
                  {summary?.[card.key] ?? 0}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <ApprovalQueueList
        items={items}
        totalRecords={totalRecords}
        isLoading={isLoading}
        dateFormat={dateFormat}
        params={params}
        tableConfig={tableConfig}
      />
    </DisplayTemplate>
  );
}
