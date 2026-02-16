import {
  Check,
  MessageSquare,
  Pencil,
  Save,
  SendHorizonal,
  ShoppingCart,
  Trash2,
  Undo2,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const canSubmit =
    role === STAGE_ROLE.CREATE && prStatus !== "in_progress";

  const canApprove = role === STAGE_ROLE.APPROVE;
  const canPurchaseApprove = role === STAGE_ROLE.PURCHASE;
  const canAction = canApprove || canPurchaseApprove;

  return (
    <>
      {canSubmit && (
        <Button
          size="sm"
          variant="info"
          onClick={onSubmitPr}
          disabled={isPending}
        >
          <SendHorizonal />
          Submit
        </Button>
      )}
      {canApprove && (
        <Button
          size="sm"
          variant="success"
          onClick={onApprove}
          disabled={isPending}
        >
          <Check />
          Approve
        </Button>
      )}
      {canPurchaseApprove && (
        <Button
          size="sm"
          variant="success"
          onClick={onPurchaseApprove}
          disabled={isPending}
        >
          <ShoppingCart />
          Purchase Approve
        </Button>
      )}
      {canAction && (
        <Button
          size="sm"
          variant="destructive"
          onClick={onReject}
          disabled={isPending}
        >
          <X />
          Reject
        </Button>
      )}
      {canAction && (
        <Button
          size="sm"
          variant="warning"
          onClick={onSendBack}
          disabled={isPending}
        >
          <Undo2 />
          Send Back
        </Button>
      )}
      {canAction && (
        <Button
          size="sm"
          variant="outline"
          onClick={onReview}
          disabled={isPending}
        >
          <RotateCcw />
          Review
        </Button>
      )}
    </>
  );
}
