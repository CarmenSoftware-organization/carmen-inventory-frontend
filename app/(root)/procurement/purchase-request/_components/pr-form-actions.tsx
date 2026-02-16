import {
  Check,
  MessageSquare,
  Pencil,
  Save,
  SendHorizonal,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FormMode } from "@/types/form";

interface PrFormActionsProps {
  readonly mode: FormMode;
  readonly isPending: boolean;
  readonly isDeletePending: boolean;
  readonly hasRecord: boolean;
  readonly onEdit: () => void;
  readonly onCancel: () => void;
  readonly onDelete: () => void;
  readonly onComment: () => void;
}

export function PrFormActions({
  mode,
  isPending,
  isDeletePending,
  hasRecord,
  onEdit,
  onCancel,
  onDelete,
  onComment,
}: PrFormActionsProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  return (
    <div className="flex items-center gap-2">
      {isView ? (
        <Button size="sm" onClick={onEdit}>
          <Pencil />
          Edit
        </Button>
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
          <Button size="sm" variant="info">
            <SendHorizonal />
            Submit
          </Button>
          <Button size="sm" variant="success">
            <Check />
            Approve
          </Button>
          <Button size="sm" variant="destructive">
            <X />
            Reject
          </Button>
          <Button size="sm" variant="warning">
            <Undo2 />
            Send Back
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
