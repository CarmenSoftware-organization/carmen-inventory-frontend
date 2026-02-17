import { useState, useCallback, useEffect } from "react";
import type { CategoryNode } from "@/types/category";
import type { FormMode } from "@/types/form";

interface UseCategoryDialogProps {
  categoryData: CategoryNode[];
  onSubmit: (data: Record<string, unknown>) => Promise<void> | void;
}

export function useCategoryDialog({
  categoryData,
  onSubmit,
}: UseCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("add");
  const [selectedNode, setSelectedNode] = useState<CategoryNode | undefined>();
  const [parentNode, setParentNode] = useState<CategoryNode | undefined>();

  // Auto-resolve parent node when editing subcategory or itemGroup
  useEffect(() => {
    if (mode !== "edit" || !selectedNode || !categoryData.length) return;

    if (
      selectedNode.type === "subcategory" &&
      selectedNode.product_category_id
    ) {
      const parent = categoryData.find(
        (c) => c.id === selectedNode.product_category_id
      );
      if (parent) setParentNode(parent);
    } else if (
      selectedNode.type === "itemGroup" &&
      selectedNode.product_subcategory_id
    ) {
      for (const cat of categoryData) {
        const parent = cat.children?.find(
          (s) => s.id === selectedNode.product_subcategory_id
        );
        if (parent) {
          setParentNode(parent);
          break;
        }
      }
    }
  }, [mode, selectedNode, categoryData]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedNode(undefined);
      setParentNode(undefined);
    }
  }, []);

  const handleEdit = useCallback((node: CategoryNode) => {
    setMode("edit");
    setSelectedNode(node);
    setOpen(true);
  }, []);

  const handleAdd = useCallback((parent?: CategoryNode) => {
    setMode("add");
    setParentNode(parent);
    setSelectedNode(undefined);
    setOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (data: Record<string, unknown>) => {
      onSubmit(data);
    },
    [onSubmit]
  );

  return {
    open,
    mode,
    selectedNode,
    parentNode,
    handleOpenChange,
    handleEdit,
    handleAdd,
    handleSubmit,
  };
}
