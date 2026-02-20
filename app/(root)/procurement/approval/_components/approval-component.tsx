"use client";

import { ClipboardList, FileText } from "lucide-react";
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
import ApprovalQueueList from "./approve-queue-list";

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
        {summaryLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-3 flex items-center gap-3"
            >
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardList className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-none">
                  Total Pending
                </p>
                <p className="text-lg font-semibold leading-tight tabular-nums">
                  {summary?.total ?? 0}
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-info/10">
                <FileText className="size-4 text-info" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-none">
                  Purchase Request
                </p>
                <p className="text-lg font-semibold leading-tight tabular-nums">
                  {summary?.pr ?? 0}
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-info/10">
                <FileText className="size-4 text-info" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-none">
                  Purchase Order
                </p>
                <p className="text-lg font-semibold leading-tight tabular-nums">
                  {summary?.po ?? 0}
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-info/10">
                <FileText className="size-4 text-info" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground leading-none">
                  Store Requisition
                </p>
                <p className="text-lg font-semibold leading-tight tabular-nums">
                  {summary?.sr ?? 0}
                </p>
              </div>
            </div>
          </>
        )}
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
