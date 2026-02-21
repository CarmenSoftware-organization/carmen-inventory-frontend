import { useState } from "react";
import {
  Check,
  ChevronDown,
  Eye,
  MessageSquare,
  Pencil,
  Save,
  SendHorizonal,
  ShoppingCart,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  readonly onEdit: () => void;
  readonly onCancel: () => void;
  readonly onDelete: () => void;
  readonly onComment: () => void;
  readonly onSubmitPr?: () => void;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onSendBack?: () => void;
  readonly onReview?: () => void;
  readonly onPurchaseApprove?: () => void;
}

export function PrFormActions({
  mode,
  role,
  prStatus,
  isPending,
  isDeletePending,
  hasRecord,
  onEdit,
  onCancel,
  onDelete,
  onComment,
  onSubmitPr,
  onApprove,
  onReject,
  onSendBack,
  onReview,
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
            <Button size="sm" onClick={onEdit}>
              <Pencil />
              Edit
            </Button>
          )}

          {showWorkflowActions && (
            <WorkflowActions
              role={role}
              prStatus={prStatus}
              isPending={isPending}
              onSubmitPr={onSubmitPr}
              onApprove={onApprove}
              onReject={onReject}
              onSendBack={onSendBack}
              onReview={onReview}
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

      {isEdit && hasRecord && (
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

      <Button size="sm" onClick={onComment}>
        <MessageSquare />
        Comment
      </Button>
    </div>
  );
}

interface WorkflowActionsProps {
  readonly role?: string;
  readonly prStatus?: string;
  readonly isPending: boolean;
  readonly onSubmitPr?: () => void;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onSendBack?: () => void;
  readonly onReview?: () => void;
  readonly onPurchaseApprove?: () => void;
}

type ConfirmConfig = {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "default" | "destructive" | "success" | "info";
  onConfirm: () => void;
};

function WorkflowActions({
  role,
  prStatus,
  isPending,
  onSubmitPr,
  onApprove,
  onReject,
  onSendBack,
  onReview,
  onPurchaseApprove,
}: WorkflowActionsProps) {
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const canSubmit =
    role === STAGE_ROLE.CREATE && prStatus !== "in_progress";

  const canApprove = role === STAGE_ROLE.APPROVE;
  const canPurchaseApprove = role === STAGE_ROLE.PURCHASE;
  const canAction = canApprove || canPurchaseApprove;

  const openConfirm = (config: ConfirmConfig) => setConfirm(config);

  return (
    <>
      {canSubmit && (
        <Button
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

      {canApprove && (
        <Button
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

      {canPurchaseApprove && (
        <Button
          size="sm"
          variant="success"
          disabled={isPending}
          onClick={() =>
            openConfirm({
              title: "Purchase Approve",
              description:
                "This will approve for purchasing. Are you sure?",
              confirmLabel: "Purchase Approve",
              variant: "success",
              onConfirm: () => onPurchaseApprove?.(),
            })
          }
        >
          <ShoppingCart />
          Purchase Approve
        </Button>
      )}

      {canAction && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={isPending}>
              More
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onReject}>
              <X className="text-destructive" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSendBack}>
              <Undo2 className="text-warning" />
              Send Back
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onReview}>
              <Eye />
              Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
}
