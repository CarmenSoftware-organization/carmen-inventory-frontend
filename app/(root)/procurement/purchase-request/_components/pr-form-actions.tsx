import {
  MessageSquare,
  Pencil,
  Save,
  Trash2,
  X,
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
}: PrFormActionsProps) {
  const isView = mode === "view";
  const isVoided = prStatus === "voided";
  const isViewOnly = role === STAGE_ROLE.VIEW_ONLY;

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

      {prStatus === "draft" && (
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
