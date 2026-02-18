"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/reui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PR_STATUS_CONFIG } from "@/constant/purchase-request";
import { useApproveAction, useRejectAction } from "@/hooks/use-approval";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import type { ApprovalItem } from "@/types/approval";
import { PrActionDialog } from "../../purchase-request/_components/pr-action-dialog";
import { PrWorkflowStep } from "../../purchase-request/_components/pr-workflow-step";
import { PrWorkflowHistory } from "../../purchase-request/_components/pr-workflow-history";
import { ApprovalItemTable } from "./approval-item-table";

interface ApprovalDetailProps {
  readonly item: ApprovalItem;
}

export function ApprovalDetail({ item }: ApprovalDetailProps) {
  const router = useRouter();
  const { dateFormat } = useProfile();
  const [rejectOpen, setRejectOpen] = useState(false);

  const approveAction = useApproveAction();
  const rejectAction = useRejectAction();
  const isPending = approveAction.isPending || rejectAction.isPending;

  const handleApprove = () => {
    const details = item.purchase_request_detail.map((d) => ({
      id: d.id,
      stage_status: "approve",
      stage_message: "",
    }));

    approveAction.mutate(
      { id: item.id, state_role: item.role || "approve", details },
      {
        onSuccess: () => {
          toast.success("Approved successfully");
          router.push("/procurement/approval");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleRejectConfirm = (message: string) => {
    const details = item.purchase_request_detail.map((d) => ({
      id: d.id,
      stage_status: "rejected",
      stage_message: message,
    }));

    rejectAction.mutate(
      { id: item.id, state_role: item.role || "approve", details },
      {
        onSuccess: () => {
          toast.success("Rejected successfully");
          setRejectOpen(false);
          router.push("/procurement/approval");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const statusConfig =
    PR_STATUS_CONFIG[item.pr_status ?? "draft"] ?? PR_STATUS_CONFIG.draft;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/procurement/approval")}
          >
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-1.5">
            <h1 className="font-semibold text-lg">{item.pr_no}</h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={handleApprove}
            disabled={isPending}
          >
            <Check />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setRejectOpen(true)}
            disabled={isPending}
          >
            <X />
            Reject
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-2xl">
        <InfoCell label="Date" value={formatDate(item.pr_date, dateFormat)} />
        <InfoCell label="Requestor" value={item.requestor_name} />
        <InfoCell label="Department" value={item.department_name} />
        <InfoCell label="Workflow" value={item.workflow_name} />
      </div>

      {item.description && (
        <div className="text-xs text-muted-foreground max-w-2xl">
          {item.description}
        </div>
      )}

      <Tabs defaultValue="items">
        <TabsList variant="line">
          <TabsTrigger value="items">Items</TabsTrigger>
          {(item.workflow_history?.length ?? 0) > 0 && (
            <TabsTrigger value="history">Workflow History</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="items">
          <ApprovalItemTable details={item.purchase_request_detail} />
          {item.workflow_current_stage && (
            <PrWorkflowStep
              previousStage={item.workflow_previous_stage}
              currentStage={item.workflow_current_stage}
              nextStage={item.workflow_next_stage}
            />
          )}
        </TabsContent>
        {(item.workflow_history?.length ?? 0) > 0 && (
          <TabsContent value="history">
            <PrWorkflowHistory history={item.workflow_history} />
          </TabsContent>
        )}
      </Tabs>

      {rejectOpen && (
        <PrActionDialog
          open={rejectOpen}
          onOpenChange={(open) => {
            if (!open && !isPending) setRejectOpen(false);
          }}
          isPending={rejectAction.isPending}
          onConfirm={handleRejectConfirm}
          title="Reject Request"
          description="Please provide a reason for rejecting this request."
          confirmLabel="Reject"
          confirmVariant="destructive"
        />
      )}
    </div>
  );
}

function InfoCell({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="text-xs">
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium truncate">{value || "\u2014"}</p>
    </div>
  );
}
