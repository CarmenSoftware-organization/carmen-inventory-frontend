import { Skeleton } from "@/components/ui/skeleton";
import { PR_STATUS_CONFIG } from "@/constant/purchase-request";
import { ApprovalItem } from "@/types/approval";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ApprovalQueueListProps {
  readonly items: ApprovalItem[];
  readonly isLoading: boolean;
  readonly isPending: boolean;
  readonly dateFormat: string;
  readonly onView: (item: ApprovalItem) => void;
  readonly onApprove: (item: ApprovalItem) => void;
  readonly onReject: (item: ApprovalItem) => void;
}

export default function ApprovalQueueList({
  items,
  isLoading,
  isPending,
  dateFormat,
  onView,
  onApprove,
  onReject,
}: ApprovalQueueListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3 flex items-center gap-4">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card flex flex-col items-center justify-center py-16 gap-2">
        <Clock className="size-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No pending approvals</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card divide-y">
      {/* Column Header */}
      <div className="grid grid-cols-[1fr_120px_120px_100px_100px_140px] gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
        <span>Document</span>
        <span>Requestor</span>
        <span>Department</span>
        <span className="text-center">Status</span>
        <span className="text-center">Stage</span>
        <span className="text-right">Action</span>
      </div>

      {/* Rows */}
      {items.map((item) => {
        const statusConfig =
          PR_STATUS_CONFIG[item.pr_status ?? "draft"] ?? PR_STATUS_CONFIG.draft;

        const totalAmount = item.purchase_request_detail?.reduce(
          (sum, d) => sum + (d.total_price ?? 0),
          0,
        );

        return (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_120px_120px_100px_100px_140px] gap-2 px-3 py-2.5 items-center hover:bg-muted/20 transition-colors"
          >
            {/* Document Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold hover:underline text-left truncate"
                  onClick={() => onView(item)}
                >
                  {item.pr_no}
                </button>
                {item.workflow_name && (
                  <Badge variant="outline" size="xs">
                    {item.workflow_name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                <span>{formatDate(item.pr_date, dateFormat)}</span>
                {item.purchase_request_detail?.length > 0 && (
                  <>
                    <span>|</span>
                    <span>{item.purchase_request_detail.length} items</span>
                  </>
                )}
                {totalAmount > 0 && (
                  <>
                    <span>|</span>
                    <span className="tabular-nums font-medium text-foreground">
                      {totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Requestor */}
            <span className="text-xs truncate">
              {item.requestor_name || "\u2014"}
            </span>

            {/* Department */}
            <span className="text-xs truncate">
              {item.department_name || "\u2014"}
            </span>

            {/* Status */}
            <div className="text-center">
              <Badge variant={statusConfig.variant} size="xs">
                {statusConfig.label}
              </Badge>
            </div>

            {/* Stage */}
            <div className="text-center">
              {item.workflow_current_stage ? (
                <Badge variant="outline" size="xs">
                  {item.workflow_current_stage}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {"\u2014"}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1">
              <Button
                size="xs"
                variant="success"
                onClick={() => onApprove(item)}
                disabled={isPending}
              >
                Approve
              </Button>
              <Button
                size="xs"
                variant="destructive"
                onClick={() => onReject(item)}
                disabled={isPending}
              >
                Reject
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
