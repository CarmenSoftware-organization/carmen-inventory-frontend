import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getModeLabels, type FormMode } from "@/types/form";

interface FormToolbarProps {
  readonly entity: string;
  readonly mode: FormMode;
  readonly formId: string;
  readonly isPending: boolean;
  readonly onBack: () => void;
  readonly onCancel: () => void;
  readonly onEdit: () => void;
  readonly onDelete?: () => void;
  readonly deleteIsPending?: boolean;
  readonly children?: React.ReactNode;
}

export function FormToolbar({
  entity,
  mode,
  formId,
  isPending,
  onBack,
  onCancel,
  onEdit,
  onDelete,
  deleteIsPending = false,
  children,
}: FormToolbarProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const labels = getModeLabels(mode, entity);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Go back">
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold">{labels.title}</h1>
      </div>
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
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              form={formId}
              disabled={isPending}
            >
              {isPending ? labels.pending : labels.submit}
            </Button>
          </>
        )}
        {isEdit && onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isPending || deleteIsPending}
          >
            <Trash2 />
            Delete
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
