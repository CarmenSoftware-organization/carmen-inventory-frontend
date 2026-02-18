"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useApprovalPending,
  useApproveAction,
  useRejectAction,
} from "@/hooks/use-approval";
import { useListPageState } from "@/hooks/use-list-page-state";
import { useProfile } from "@/hooks/use-profile";
import type { ApprovalItem } from "@/types/approval";
import type { ParamsDto } from "@/types/params";
import SearchInput from "@/components/search-input";
import { ErrorState } from "@/components/ui/error-state";
import DisplayTemplate from "@/components/display-template";
import { PrActionDialog } from "../../purchase-request/_components/pr-action-dialog";
import ApprovalQueueList from "./approve-queue-list";

export default function ApprovalComponent() {
  const router = useRouter();
  const { dateFormat } = useProfile();
  const [rejectItem, setRejectItem] = useState<ApprovalItem | null>(null);

  const {
    search,
    setSearch,
    pageNumber,
    perpageNumber,
    handlePageChange,
    handleSetPerpage,
  } = useListPageState({ defaultPerpage: 10 });

  const params: ParamsDto = {
    page: pageNumber,
    perpage: perpageNumber,
    search: search || undefined,
  };

  const { data, isLoading, error, refetch } = useApprovalPending(params);
  const approveAction = useApproveAction();
  const rejectAction = useRejectAction();

  const rawItems = data?.data;
  const items = useMemo(() => rawItems ?? [], [rawItems]);
  const totalRecords = data?.paginate?.total ?? 0;
  const totalPages = Math.ceil(totalRecords / perpageNumber);
  const isPending = approveAction.isPending || rejectAction.isPending;

  const from = totalRecords > 0 ? (pageNumber - 1) * perpageNumber + 1 : 0;
  const to = Math.min(pageNumber * perpageNumber, totalRecords);

  const summary = useMemo(() => {
    const types = new Map<string, number>();
    for (const item of items) {
      const type = item.workflow_name || "Other";
      types.set(type, (types.get(type) ?? 0) + 1);
    }
    return { total: totalRecords, types };
  }, [items, totalRecords]);

  const handleApprove = (item: ApprovalItem) => {
    const details = item.purchase_request_detail.map((d) => ({
      id: d.id,
      stage_status: "approve",
      stage_message: "",
    }));

    approveAction.mutate(
      { id: item.id, state_role: item.role || "approve", details },
      {
        onSuccess: () => toast.success("Approved successfully"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleRejectConfirm = (message: string) => {
    if (!rejectItem) return;

    const details = rejectItem.purchase_request_detail.map((d) => ({
      id: d.id,
      stage_status: "rejected",
      stage_message: message,
    }));

    rejectAction.mutate(
      { id: rejectItem.id, state_role: rejectItem.role || "approve", details },
      {
        onSuccess: () => {
          toast.success("Rejected successfully");
          setRejectItem(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Approval"
      description="Review and approve pending procurement requests."
      toolbar={<SearchInput defaultValue={search} onSearch={setSearch} />}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground leading-none">
              Total Pending
            </p>
            <p className="text-lg font-semibold leading-tight tabular-nums">
              {isLoading ? (
                <Skeleton className="h-5 w-8 mt-0.5" />
              ) : (
                summary.total
              )}
            </p>
          </div>
        </div>
        {!isLoading &&
          Array.from(summary.types.entries())
            .slice(0, 3)
            .map(([type, count]) => (
              <div
                key={type}
                className="rounded-lg border bg-card p-3 flex items-center gap-3"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-info/10">
                  <FileText className="size-4 text-info" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground leading-none truncate">
                    {type}
                  </p>
                  <p className="text-lg font-semibold leading-tight tabular-nums">
                    {count}
                  </p>
                </div>
              </div>
            ))}
        {isLoading &&
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
          ))}
      </div>

      <ApprovalQueueList
        items={items}
        isLoading={isLoading}
        isPending={isPending}
        dateFormat={dateFormat}
        onView={(item) => router.push(`/procurement/approval/${item.id}`)}
        onApprove={handleApprove}
        onReject={(item) => setRejectItem(item)}
      />

      {/* Pagination */}
      {totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-1">
          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground text-xs">Rows per page</span>
            <Select
              value={`${perpageNumber}`}
              onValueChange={(v) => {
                handleSetPerpage(Number(v));
                handlePageChange(1);
              }}
            >
              <SelectTrigger className="w-16 h-7 text-xs" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top" className="min-w-18">
                {[5, 10, 25, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground text-xs text-nowrap">
              {from} - {to} of {totalRecords}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="size-7"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="size-7"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber >= totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {rejectItem && (
        <PrActionDialog
          open={!!rejectItem}
          onOpenChange={(open) => {
            if (!open && !isPending) setRejectItem(null);
          }}
          isPending={rejectAction.isPending}
          onConfirm={handleRejectConfirm}
          title="Reject Request"
          description="Please provide a reason for rejecting this request."
          confirmLabel="Reject"
          confirmVariant="destructive"
        />
      )}
    </DisplayTemplate>
  );
}
