"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, Plus, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import SearchInput from "@/components/search-input";
import DisplayTemplate from "@/components/display-template";
import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-category";
import {
  useSubCategory,
  useCreateSubCategory,
  useUpdateSubCategory,
  useDeleteSubCategory,
} from "@/hooks/use-subcategory";
import {
  useItemGroup,
  useCreateItemGroup,
  useUpdateItemGroup,
  useDeleteItemGroup,
} from "@/hooks/use-item-group";
import { NODE_TYPE, type CategoryNode } from "@/types/category";
import { useCategoryTree } from "./use-category-tree";
import { useCategoryDialog } from "./use-category-dialog";
import { CategoryDialog } from "./category-dialog";
import type { CategoryFormValues } from "./category-form";
import TreeContent from "./tree-content";

const NODE_LABELS: Record<string, string> = {
  [NODE_TYPE.CATEGORY]: "Category",
  [NODE_TYPE.SUBCATEGORY]: "Subcategory",
  [NODE_TYPE.ITEM_GROUP]: "Item Group",
};

export default function CategoryComponent() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CategoryNode | null>(null);

  // Data
  const { data: catData, isLoading: catLoading } = useCategory({
    perpage: -1,
  });
  const { data: subData, isLoading: subLoading } = useSubCategory({
    perpage: -1,
  });
  const { data: igData, isLoading: igLoading } = useItemGroup({
    perpage: -1,
  });
  const isLoading = catLoading || subLoading || igLoading;

  // Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createSubCategory = useCreateSubCategory();
  const updateSubCategory = useUpdateSubCategory();
  const deleteSubCategory = useDeleteSubCategory();
  const createItemGroup = useCreateItemGroup();
  const updateItemGroup = useUpdateItemGroup();
  const deleteItemGroup = useDeleteItemGroup();

  const isMutating =
    createCategory.isPending ||
    updateCategory.isPending ||
    createSubCategory.isPending ||
    updateSubCategory.isPending ||
    createItemGroup.isPending ||
    updateItemGroup.isPending;

  const isDeleting =
    deleteCategory.isPending ||
    deleteSubCategory.isPending ||
    deleteItemGroup.isPending;

  // Tree
  const { categoryData, expanded, expandAll, collapseAll, toggleExpand } =
    useCategoryTree({
      categories: catData?.data ?? [],
      subCategories: subData?.data ?? [],
      itemGroups: igData?.data ?? [],
      isLoading,
    });

  // Search
  const nodeMatches = (node: CategoryNode, q: string): boolean => {
    const self =
      node.code.toLowerCase().includes(q) ||
      node.name.toLowerCase().includes(q) ||
      (node.description?.toLowerCase().includes(q) ?? false);
    if (self) return true;
    return node.children?.some((c) => nodeMatches(c, q)) ?? false;
  };

  const filteredData = useMemo(() => {
    if (!search) return categoryData;
    const q = search.toLowerCase();
    return categoryData.filter((cat) => nodeMatches(cat, q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryData, search]);

  const searchExpanded = useMemo(() => {
    if (!search) return {};
    const q = search.toLowerCase();
    const result: Record<string, boolean> = {};
    const walk = (nodes: CategoryNode[]) => {
      for (const node of nodes) {
        if (nodeMatches(node, q)) result[node.id] = true;
        if (node.children?.length) walk(node.children);
      }
    };
    walk(filteredData);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, search]);

  // Stats
  const stats = useMemo(() => {
    const cats = catData?.data?.length ?? 0;
    const subs = subData?.data?.length ?? 0;
    const igs = igData?.data?.length ?? 0;
    return { cats, subs, igs, total: cats + subs + igs };
  }, [catData, subData, igData]);

  // Dialog
  const {
    open: dialogOpen,
    mode: dialogMode,
    selectedNode,
    parentNode,
    handleOpenChange,
    handleEdit,
    handleAdd,
  } = useCategoryDialog({ categoryData, onSubmit: () => {} });

  const handleFormSubmit = useCallback(
    (data: CategoryFormValues) => {
      const isEdit = dialogMode === "edit";
      const ok = () => handleOpenChange(false);
      const opts = (label: string) => ({
        onSuccess: () => {
          toast.success(`${label} ${isEdit ? "updated" : "created"}`);
          ok();
        },
        onError: (e: Error) => toast.error(e.message),
      });

      if (isEdit && selectedNode) {
        const payload = { id: selectedNode.id, ...data };
        const actions = {
          [NODE_TYPE.CATEGORY]: () =>
            updateCategory.mutate(payload, opts("Category")),
          [NODE_TYPE.SUBCATEGORY]: () =>
            updateSubCategory.mutate(
              {
                ...payload,
                product_category_id: data.product_category_id ?? "",
              },
              opts("Subcategory"),
            ),
          [NODE_TYPE.ITEM_GROUP]: () =>
            updateItemGroup.mutate(
              {
                ...payload,
                product_subcategory_id: data.product_subcategory_id ?? "",
              },
              opts("Item group"),
            ),
        };
        actions[selectedNode.type]();
      } else if (parentNode) {
        const actions: Record<string, () => void> = {
          [NODE_TYPE.CATEGORY]: () =>
            createSubCategory.mutate(
              { ...data, product_category_id: parentNode.id },
              opts("Subcategory"),
            ),
          [NODE_TYPE.SUBCATEGORY]: () =>
            createItemGroup.mutate(
              { ...data, product_subcategory_id: parentNode.id },
              opts("Item group"),
            ),
        };
        actions[parentNode.type]?.();
      } else {
        createCategory.mutate(data, opts("Category"));
      }
    },
    [
      dialogMode,
      selectedNode,
      parentNode,
      handleOpenChange,
      createCategory,
      updateCategory,
      createSubCategory,
      updateSubCategory,
      createItemGroup,
      updateItemGroup,
    ],
  );

  // Delete
  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const opts = {
      onSuccess: () => {
        toast.success(`${NODE_LABELS[deleteTarget.type]} deleted`);
        setDeleteTarget(null);
      },
      onError: (e: Error) => toast.error(e.message),
    };
    const actions = {
      [NODE_TYPE.CATEGORY]: () => deleteCategory.mutate(deleteTarget.id, opts),
      [NODE_TYPE.SUBCATEGORY]: () =>
        deleteSubCategory.mutate(deleteTarget.id, opts),
      [NODE_TYPE.ITEM_GROUP]: () =>
        deleteItemGroup.mutate(deleteTarget.id, opts),
    };
    actions[deleteTarget.type]();
  }, [deleteTarget, deleteCategory, deleteSubCategory, deleteItemGroup]);

  return (
    <DisplayTemplate
      title="Category"
      description="Manage product categories, subcategories, and item groups."
      toolbar={
        <SearchInput
          defaultValue={search}
          onSearch={setSearch}
          onInputChange={setSearch}
          inputClassName="h-7 placeholder:text-xs"
        />
      }
      actions={
        <div className="flex items-center gap-1.5">
          <Button onClick={expandAll} size="xs" variant="outline">
            <ChevronDown className="h-3 w-3" />
            Expand
          </Button>
          <Button onClick={collapseAll} size="xs" variant="outline">
            <ChevronUp className="h-3 w-3" />
            Collapse
          </Button>
          <Button onClick={() => handleAdd()} size="xs">
            <Plus className="h-3 w-3" />
            Add Category
          </Button>
        </div>
      }
    >
      {/* Summary bar */}
      {!isLoading && (
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground px-1 py-1">
          <span className="font-medium text-foreground/70">
            {stats.total} items
          </span>
          <span className="text-border">|</span>
          <span>{stats.cats} categories</span>
          <span className="text-border">|</span>
          <span>{stats.subs} subcategories</span>
          <span className="text-border">|</span>
          <span>{stats.igs} item groups</span>
        </div>
      )}

      {/* Tree */}
      <div className="border rounded-md bg-card">
        {/* Header row */}
        <div className="flex items-center h-7 px-2 bg-muted/40 border-b text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <FolderTree className="h-3 w-3 mr-1.5" />
          Category Tree
        </div>

        <ScrollArea className="h-[calc(100vh-240px)]">
          <TreeContent
            isLoading={isLoading}
            filteredData={filteredData}
            expanded={search ? searchExpanded : expanded}
            toggleExpand={toggleExpand}
            onEdit={handleEdit}
            onAdd={handleAdd}
            onDelete={setDeleteTarget}
            search={search}
          />
        </ScrollArea>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        mode={dialogMode}
        selectedNode={selectedNode}
        parentNode={parentNode}
        onSubmit={handleFormSubmit}
        isPending={isMutating}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
        title={`Delete ${NODE_LABELS[deleteTarget?.type ?? "category"]}`}
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </DisplayTemplate>
  );
}
