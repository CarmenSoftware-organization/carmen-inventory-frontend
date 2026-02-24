"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronRight, Search } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { WorkflowCreateModel, Product } from "@/types/workflows";
import { cn } from "@/lib/utils";

interface TreeNode {
  id: string;
  name: string;
  type: "category" | "sub_category" | "item_group" | "product";
  children: TreeNode[];
  product?: Product;
}

const buildTree = (products: Product[]): TreeNode[] => {
  const categoryMap = new Map<string, TreeNode>();

  for (const p of products) {
    const catId = p.product_category?.id ?? "uncategorized";
    const catName = p.product_category?.name ?? "Uncategorized";
    const subCatId = p.product_sub_category?.id ?? "uncategorized";
    const subCatName = p.product_sub_category?.name ?? "Uncategorized";
    const groupId = p.product_item_group?.id ?? "uncategorized";
    const groupName = p.product_item_group?.name ?? "Uncategorized";

    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        id: catId,
        name: catName,
        type: "category",
        children: [],
      });
    }
    const catNode = categoryMap.get(catId)!;

    let subCatNode = catNode.children.find((c) => c.id === subCatId);
    if (!subCatNode) {
      subCatNode = {
        id: subCatId,
        name: subCatName,
        type: "sub_category",
        children: [],
      };
      catNode.children.push(subCatNode);
    }

    let groupNode = subCatNode.children.find((c) => c.id === groupId);
    if (!groupNode) {
      groupNode = {
        id: groupId,
        name: groupName,
        type: "item_group",
        children: [],
      };
      subCatNode.children.push(groupNode);
    }

    groupNode.children.push({
      id: p.id,
      name: `${p.code} — ${p.name}`,
      type: "product",
      children: [],
      product: p,
    });
  }

  return Array.from(categoryMap.values());
};

const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
  if (!query) return nodes;
  const q = query.toLowerCase();

  return nodes
    .map((node) => {
      if (node.type === "product") {
        const matches =
          node.name.toLowerCase().includes(q) ||
          (node.product?.code?.toLowerCase().includes(q) ?? false);
        return matches ? node : null;
      }
      const filteredChildren = filterTree(node.children, query);
      if (filteredChildren.length === 0) return null;
      return { ...node, children: filteredChildren };
    })
    .filter(Boolean) as TreeNode[];
};

interface WfProductsProps {
  readonly form: UseFormReturn<WorkflowCreateModel>;
  readonly allProducts: Product[];
  readonly isDisabled: boolean;
}

export function WfProducts({ form, allProducts, isDisabled }: WfProductsProps) {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const tree = buildTree(allProducts);
    const ids = new Set<string>();
    for (const cat of tree) {
      ids.add(cat.id);
      for (const sub of cat.children) {
        ids.add(sub.id);
      }
    }
    return ids;
  });

  const tree = useMemo(() => buildTree(allProducts), [allProducts]);
  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);

  const leafIdsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const compute = (node: TreeNode): string[] => {
      if (node.type === "product") {
        map.set(node.id, [node.id]);
        return [node.id];
      }
      const ids = node.children.flatMap(compute);
      map.set(node.id, ids);
      return ids;
    };
    for (const cat of tree) compute(cat);
    return map;
  }, [tree]);

  const selectedProducts = useWatch({
    control: form.control,
    name: "data.products",
  });
  const selectedIds = useMemo(
    () => new Set((selectedProducts ?? []).map((p) => p.id)),
    [selectedProducts],
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleProduct = useCallback(
    (product: Product) => {
      if (isDisabled) return;
      const current = form.getValues("data.products") ?? [];
      if (selectedIds.has(product.id)) {
        form.setValue(
          "data.products",
          current.filter((p) => p.id !== product.id),
        );
      } else {
        form.setValue("data.products", [...current, product]);
      }
    },
    [form, selectedIds, isDisabled],
  );

  const toggleGroup = useCallback(
    (node: TreeNode) => {
      if (isDisabled) return;
      const leafIds = leafIdsMap.get(node.id) ?? [];
      const allSelected = leafIds.every((id) => selectedIds.has(id));
      const current = form.getValues("data.products") ?? [];

      if (allSelected) {
        const removeSet = new Set(leafIds);
        form.setValue(
          "data.products",
          current.filter((p) => !removeSet.has(p.id)),
        );
      } else {
        const allProductsMap = new Map(allProducts.map((p) => [p.id, p]));
        const toAdd = leafIds
          .filter((id) => !selectedIds.has(id))
          .map((id) => allProductsMap.get(id))
          .filter(Boolean) as Product[];
        form.setValue("data.products", [...current, ...toAdd]);
      }
    },
    [form, selectedIds, allProducts, isDisabled, leafIdsMap],
  );

  const getCheckState = useCallback(
    (node: TreeNode): boolean | "indeterminate" => {
      const leafIds = leafIdsMap.get(node.id) ?? [];
      const selectedCount = leafIds.filter((id) => selectedIds.has(id)).length;
      if (selectedCount === 0) return false;
      if (selectedCount === leafIds.length) return true;
      return "indeterminate";
    },
    [leafIdsMap, selectedIds],
  );

  return (
    <div className="space-y-2 pt-3">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name or code..."
            className="h-8 pl-7 text-xs placeholder:text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {selectedProducts?.length ?? 0} selected
        </span>
      </div>

      <div className="max-h-105 overflow-y-auto rounded border p-1.5">
        {filteredTree.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-muted-foreground">
            {search
              ? "No products match your search."
              : "No products available."}
          </p>
        ) : (
          filteredTree.map((catNode) => (
            <TreeNodeRow
              key={catNode.id}
              node={catNode}
              depth={0}
              expandedIds={expandedIds}
              forceExpand={!!search}
              onToggleExpand={toggleExpand}
              onToggleProduct={toggleProduct}
              onToggleGroup={toggleGroup}
              getCheckState={getCheckState}
              selectedIds={selectedIds}
              isDisabled={isDisabled}
              leafIdsMap={leafIdsMap}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TreeNodeRowProps {
  readonly node: TreeNode;
  readonly depth: number;
  readonly expandedIds: Set<string>;
  readonly forceExpand: boolean;
  readonly onToggleExpand: (id: string) => void;
  readonly onToggleProduct: (product: Product) => void;
  readonly onToggleGroup: (node: TreeNode) => void;
  readonly getCheckState: (node: TreeNode) => boolean | "indeterminate";
  readonly selectedIds: Set<string>;
  readonly isDisabled: boolean;
  readonly leafIdsMap: Map<string, string[]>;
}

const TreeNodeRow = ({
  node,
  depth,
  expandedIds,
  forceExpand,
  onToggleExpand,
  onToggleProduct,
  onToggleGroup,
  getCheckState,
  selectedIds,
  isDisabled,
  leafIdsMap,
}: TreeNodeRowProps) => {
  const isExpanded = forceExpand || expandedIds.has(node.id);
  const isProduct = node.type === "product";
  const paddingLeft = depth * 16 + 4;

  if (isProduct) {
    return (
      <div
        className="flex items-center gap-1.5 rounded py-1.5 hover:bg-muted/50"
        style={{ paddingLeft }}
      >
        <div className="w-3" />
        <Checkbox
          checked={selectedIds.has(node.id)}
          onCheckedChange={() => node.product && onToggleProduct(node.product)}
          disabled={isDisabled}
        />
        <span className="text-[11px]">{node.name}</span>
      </div>
    );
  }

  const checkState = getCheckState(node);

  return (
    <>
      <div
        className="flex items-center gap-1.5 rounded py-1.5 hover:bg-muted/50"
        style={{ paddingLeft }}
      >
        <button
          type="button"
          className="shrink-0 cursor-pointer"
          onClick={() => onToggleExpand(node.id)}
        >
          <ChevronRight
            className={cn(
              "size-3 text-muted-foreground transition-transform",
              isExpanded && "rotate-90",
            )}
          />
        </button>
        <Checkbox
          checked={checkState}
          onCheckedChange={() => onToggleGroup(node)}
          disabled={isDisabled}
        />
        <button
          type="button"
          className="flex flex-1 items-center gap-1.5 text-left cursor-pointer"
          onClick={() => onToggleExpand(node.id)}
        >
          <span className="text-[11px] font-medium">{node.name}</span>
          <span className="text-[9px] text-muted-foreground">
            ({leafIdsMap.get(node.id)?.length ?? 0})
          </span>
        </button>
      </div>
      {isExpanded &&
        node.children.map((child) => (
          <TreeNodeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            expandedIds={expandedIds}
            forceExpand={forceExpand}
            onToggleExpand={onToggleExpand}
            onToggleProduct={onToggleProduct}
            onToggleGroup={onToggleGroup}
            getCheckState={getCheckState}
            selectedIds={selectedIds}
            isDisabled={isDisabled}
            leafIdsMap={leafIdsMap}
          />
        ))}
    </>
  );
};
