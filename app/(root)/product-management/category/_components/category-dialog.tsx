"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NODE_TYPE, type CategoryNode } from "@/types/category";
import type { FormMode } from "@/types/form";
import {
  CategoryForm,
  type CategoryFormValues,
  type CategoryType,
} from "./category-form";

interface CategoryDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mode: FormMode;
  readonly selectedNode?: CategoryNode;
  readonly parentNode?: CategoryNode;
  readonly onSubmit: (data: CategoryFormValues) => void;
  readonly isPending?: boolean;
}

const TYPE_LABELS: Record<CategoryType, string> = {
  category: "Category",
  subcategory: "Subcategory",
  itemgroup: "Item Group",
};

function getCategoryType(
  mode: FormMode,
  selectedNode?: CategoryNode,
  parentNode?: CategoryNode,
): CategoryType {
  if (mode === "edit" && selectedNode) {
    if (selectedNode.type === NODE_TYPE.CATEGORY) return "category";
    if (selectedNode.type === NODE_TYPE.SUBCATEGORY) return "subcategory";
    return "itemgroup";
  }
  if (!parentNode) return "category";
  if (parentNode.type === NODE_TYPE.CATEGORY) return "subcategory";
  return "itemgroup";
}

export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  selectedNode,
  parentNode,
  onSubmit,
  isPending,
}: CategoryDialogProps) {
  const categoryType = getCategoryType(mode, selectedNode, parentNode);
  const title = `${mode === "edit" ? "Edit" : "New"} ${TYPE_LABELS[categoryType]}`;

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-95 gap-2 p-3">
        <DialogHeader className="gap-0 pb-0">
          <DialogTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <CategoryForm
            type={categoryType}
            mode={mode}
            selectedNode={selectedNode}
            parentNode={parentNode}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
