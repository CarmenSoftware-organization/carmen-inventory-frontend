import { useState } from "react";
import {
  Check,
  Eye,
  MessageSquare,
  Pencil,
  Save,
  SendHorizonal,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { STAGE_ROLE } from "@/types/stage-role";
import type { FormMode } from "@/types/form";

interface PrFormActionsProps {
  readonly mode: FormMode;
  readonly role?: string;
  readonly prStatus?: string;
  readonly isPending: boolean;
  readonly isDeletePending: boolean;
  readonly hasRecord: boolean;
  readonly itemStatuses?: string[];
  readonly onEdit: () => void;
  readonly onCancel: () => void;
  readonly onDelete: () => void;
  readonly onComment: () => void;
  readonly onSubmitPr?: () => void;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onSendBack?: () => void;
  readonly onPurchaseApprove?: () => void;
}

export function PrFormActions({
  mode,
  role,
  prStatus,
  isPending,
  isDeletePending,
  hasRecord,
  itemStatuses,
  onEdit,
  onCancel,
  onDelete,
  onComment,
  onSubmitPr,
  onApprove,
  onReject,
  onSendBack,
  onPurchaseApprove,
}: PrFormActionsProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isVoided = prStatus === "voided";
  const isViewOnly = role === STAGE_ROLE.VIEW_ONLY;
  const showWorkflowActions = isView && hasRecord && !isVoided && !isViewOnly;

  return (
    <div className="flex items-center gap-2">
      {isView ? (
        <>
          {!isViewOnly && !isVoided && (
            <Button type="button" size="sm" onClick={onEdit}>
              <Pencil />
              Edit
            </Button>
          )}

          {showWorkflowActions && (
            <WorkflowActions
              role={role}
              prStatus={prStatus}
              isPending={isPending}
              itemStatuses={itemStatuses}
              onSubmitPr={onSubmitPr}
              onApprove={onApprove}
              onReject={onReject}
              onSendBack={onSendBack}
              onPurchaseApprove={onPurchaseApprove}
            />
          )}
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            <X />
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            form="purchase-request-form"
            disabled={isPending}
          >
            <Save />
            Save
          </Button>
        </>
      )}

      {hasRecord && (isEdit || (isView && prStatus === "draft")) && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isPending || isDeletePending}
        >
          <Trash2 />
          Delete
        </Button>
      )}

      {hasRecord && (
        <Button type="button" size="sm" variant="info" onClick={onComment}>
          <MessageSquare />
          Comment
        </Button>
      )}
    </div>
  );
}

interface WorkflowActionsProps {
  readonly role?: string;
  readonly prStatus?: string;
  readonly isPending: boolean;
  readonly itemStatuses?: string[];
  readonly onSubmitPr?: () => void;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onSendBack?: () => void;
  readonly onPurchaseApprove?: () => void;
}

type ConfirmConfig = {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "default" | "destructive" | "success" | "info" | "warning";
  onConfirm: () => void;
};

const computePurchaseAction = (
  statuses: string[],
): "none" | "review" | "rejected" | "approved" => {
  if (statuses.length === 0) return "none";
  if (statuses.includes("pending") || statuses.includes("")) return "none";
  if (statuses.includes("review")) return "review";
  if (statuses.includes("approved")) return "approved";
  if (statuses.every((s) => s === "rejected")) return "rejected";
  return "none";
};

const WorkflowActions = ({
  role,
  prStatus,
  isPending,
  itemStatuses = [],
  onSubmitPr,
  onApprove,
  onReject,
  onSendBack,
  onPurchaseApprove,
}: WorkflowActionsProps) => {
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const canSubmit = role === STAGE_ROLE.CREATE && prStatus !== "in_progress";

  const canApprove = role === STAGE_ROLE.APPROVE;
  const canPurchaseApprove = role === STAGE_ROLE.PURCHASE;
  const purchaseAction = computePurchaseAction(itemStatuses);

  const openConfirm = (config: ConfirmConfig) => setConfirm(config);

  return (
    <>
      {canSubmit && (
        <Button
          type="button"
          size="sm"
          variant="info"
          disabled={isPending}
          onClick={() =>
            openConfirm({
              title: "Submit Purchase Request",
              description:
                "This will submit the PR for approval. Are you sure?",
              confirmLabel: "Submit",
              variant: "info",
              onConfirm: () => onSubmitPr?.(),
            })
          }
        >
          <SendHorizonal />
          Submit
        </Button>
      )}

      {canApprove && purchaseAction === "approved" && (
        <Button
          type="button"
          size="sm"
          variant="success"
          disabled={isPending}
          onClick={() =>
            openConfirm({
              title: "Approve Purchase Request",
              description:
                "This will approve the PR and move it to the next stage. Are you sure?",
              confirmLabel: "Approve",
              variant: "success",
              onConfirm: () => onApprove?.(),
            })
          }
        >
          <Check />
          Approve
        </Button>
      )}

      {canApprove && purchaseAction === "rejected" && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() =>
            openConfirm({
              title: "Reject Purchase Request",
              description:
                "All items are rejected. This will reject the PR. Are you sure?",
              confirmLabel: "Reject",
              variant: "destructive",
              onConfirm: () => onReject?.(),
            })
          }
        >
          <X />
          Reject
        </Button>
      )}

      {canApprove && purchaseAction === "review" && (
        <Button
          type="button"
          size="sm"
          variant="warning"
          disabled={isPending}
          onClick={() =>
            openConfirm({
              title: "Send Back Purchase Request",
              description:
                "Some items need review. This will send the PR back. Are you sure?",
              confirmLabel: "Send Back",
              variant: "warning",
              onConfirm: () => onSendBack?.(),
            })
          }
        >
          <Eye />
          Send Back
        </Button>
      )}

      {canPurchaseApprove && purchaseAction === "approved" && (
        <Button
          type="button"
          size="sm"
          variant="success"
          disabled={isPending}
          onClick={() =>
            openConfirm({
              title: "Purchase Approve",
              description: "This will approve for purchasing. Are you sure?",
              confirmLabel: "Purchase Approve",
              variant: "success",
              onConfirm: () => onPurchaseApprove?.(),
            })
          }
        >
          <ShoppingCart />
          Approve
        </Button>
      )}

      {canPurchaseApprove && purchaseAction === "rejected" && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() =>
            openConfirm({
              title: "Reject Purchase Request",
              description:
                "All items are rejected. This will reject the PR. Are you sure?",
              confirmLabel: "Reject",
              variant: "destructive",
              onConfirm: () => onReject?.(),
            })
          }
        >
          <X />
          Reject
        </Button>
      )}

      {canPurchaseApprove && purchaseAction === "review" && (
        <Button
          type="button"
          size="sm"
          variant="warning"
          disabled={isPending}
          onClick={() =>
            openConfirm({
              title: "Send Back Purchase Request",
              description:
                "Some items need review. This will send the PR back. Are you sure?",
              confirmLabel: "Send Back",
              variant: "warning",
              onConfirm: () => onSendBack?.(),
            })
          }
        >
          <Eye />
          Send Back
        </Button>
      )}

      <AlertDialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        {confirm && (
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirm.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant={confirm.variant}
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm(null);
                }}
              >
                {confirm.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  );
};
