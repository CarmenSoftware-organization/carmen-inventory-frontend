"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/reui/badge";
import type { WorkflowHistoryEntry } from "@/types/purchase-request";

interface PrWorkflowHistoryProps {
  readonly history: WorkflowHistoryEntry[];
}

const ACTION_VARIANT: Record<
  string,
  "secondary" | "success" | "destructive" | "warning" | "outline"
> = {
  submitted: "secondary",
  approved: "success",
  rejected: "destructive",
  sent_back: "warning",
  reviewed: "outline",
};

export function PrWorkflowHistory({ history }: PrWorkflowHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No workflow history.</p>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((entry, i) => {
        const isLast = i === history.length - 1;
        const variant = ACTION_VARIANT[entry.action] ?? "outline";

        return (
          <div key={i} className="relative flex gap-3 pb-4">
            {!isLast && (
              <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
            )}
            <div
              className={cn(
                "relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2",
                i === 0
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30 bg-background",
              )}
            />

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{entry.user.name}</span>
                <Badge variant={variant} size="xs">
                  {entry.action}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {entry.current_stage && <span>{entry.current_stage}</span>}
                {entry.current_stage && entry.next_stage && <span> → </span>}
                {entry.next_stage && <span>{entry.next_stage}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
