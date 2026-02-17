import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FormMode } from "@/types/form";
import type { ProductDetail } from "@/types/product";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

const MODE_BADGE: Record<FormMode, { label: string; variant: "info" | "warning" | "secondary" }> = {
  add: { label: "New", variant: "info" },
  edit: { label: "Editing", variant: "warning" },
  view: { label: "View", variant: "secondary" },
};

interface FormToolbarProps {
  product?: ProductDetail;
  mode: FormMode;
  isPending: boolean;
  deleteIsPending: boolean;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function FormToolbar({
  product,
  mode,
  isPending,
  deleteIsPending,
  onBack,
  onEdit,
  onCancel,
  onDelete,
}: FormToolbarProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const badge = MODE_BADGE[mode];

  const title =
    mode === "view" && product
      ? `${product.code} — ${product.name}`
      : mode === "edit"
        ? "Edit Product"
        : "Add Product";

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-background py-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
        <Badge variant={badge.variant}>{badge.label}</Badge>
        {isView && product && (
          <Badge variant={product.product_status_type === "active" ? "success" : "secondary"}>
            {product.product_status_type}
          </Badge>
        )}
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
              form="product-form"
              disabled={isPending}
            >
              {isPending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save"
                  : "Create"}
            </Button>
          </>
        )}
        {isEdit && product && (
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
      </div>
    </div>
  );
}
