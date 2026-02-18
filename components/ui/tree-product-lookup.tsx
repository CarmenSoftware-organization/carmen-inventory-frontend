"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface TreeNode {
  id: string;
  name: string;
  type: "category" | "sub_category" | "item_group" | "product";
  children: TreeNode[];
}

function buildTree(products: Product[]): TreeNode[] {
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
    });
  }

  return Array.from(categoryMap.values());
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query) return nodes;
  const q = query.toLowerCase();

  return nodes
    .map((node) => {
      if (node.type === "product") {
        return node.name.toLowerCase().includes(q) ? node : null;
      }
      const filteredChildren = filterTree(node.children, query);
      if (filteredChildren.length === 0) return null;
      return { ...node, children: filteredChildren };
    })
    .filter(Boolean) as TreeNode[];
}

export interface TreeProductLookupProps {
  products: Product[];
  selectedProductIds: Set<string>;
  onSelectionChange: (productIds: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function TreeProductLookup({
  products,
  selectedProductIds,
  onSelectionChange,
  disabled = false,
  loading = false,
}: TreeProductLookupProps) {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const tree = buildTree(products);
    const ids = new Set<string>();
    for (const cat of tree) {
      ids.add(cat.id);
      for (const sub of cat.children) {
        ids.add(sub.id);
      }
    }
    return ids;
  });

  const tree = useMemo(() => buildTree(products), [products]);
  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);

  const leafIdsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    function compute(node: TreeNode): string[] {
      if (node.type === "product") {
        map.set(node.id, [node.id]);
        return [node.id];
      }
      const ids = node.children.flatMap(compute);
      map.set(node.id, ids);
      return ids;
    }
    for (const cat of tree) compute(cat);
    return map;
  }, [tree]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleProduct = useCallback(
    (productId: string) => {
      if (disabled) return;
      const next = new Set(selectedProductIds);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      onSelectionChange(Array.from(next));
    },
    [selectedProductIds, onSelectionChange, disabled],
  );

  const toggleGroup = useCallback(
    (node: TreeNode) => {
      if (disabled) return;
      const leafIds = leafIdsMap.get(node.id) ?? [];
      const allSelected = leafIds.every((id) => selectedProductIds.has(id));
      const next = new Set(selectedProductIds);

      if (allSelected) {
        for (const id of leafIds) next.delete(id);
      } else {
        for (const id of leafIds) next.add(id);
      }
      onSelectionChange(Array.from(next));
    },
    [selectedProductIds, onSelectionChange, disabled, leafIdsMap],
  );

  const getCheckState = useCallback(
    (node: TreeNode): boolean | "indeterminate" => {
      const leafIds = leafIdsMap.get(node.id) ?? [];
      const selectedCount = leafIds.filter((id) =>
        selectedProductIds.has(id),
      ).length;
      if (selectedCount === 0) return false;
      if (selectedCount === leafIds.length) return true;
      return "indeterminate";
    },
    [leafIdsMap, selectedProductIds],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="h-8 pl-7 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {selectedProductIds.size} selected
        </span>
      </div>

      <ScrollArea className="h-[300px] rounded border p-1.5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs text-muted-foreground">
              {search ? "No products match your search." : "No products available."}
            </span>
          </div>
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
              selectedProductIds={selectedProductIds}
              disabled={disabled}
              leafIdsMap={leafIdsMap}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}

interface TreeNodeRowProps {
  readonly node: TreeNode;
  readonly depth: number;
  readonly expandedIds: Set<string>;
  readonly forceExpand: boolean;
  readonly onToggleExpand: (id: string) => void;
  readonly onToggleProduct: (productId: string) => void;
  readonly onToggleGroup: (node: TreeNode) => void;
  readonly getCheckState: (node: TreeNode) => boolean | "indeterminate";
  readonly selectedProductIds: Set<string>;
  readonly disabled: boolean;
  readonly leafIdsMap: Map<string, string[]>;
}

function TreeNodeRow({
  node,
  depth,
  expandedIds,
  forceExpand,
  onToggleExpand,
  onToggleProduct,
  onToggleGroup,
  getCheckState,
  selectedProductIds,
  disabled,
  leafIdsMap,
}: TreeNodeRowProps) {
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
          checked={selectedProductIds.has(node.id)}
          onCheckedChange={() => onToggleProduct(node.id)}
          disabled={disabled}
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
          disabled={disabled}
        />
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center gap-1.5 text-left"
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
            selectedProductIds={selectedProductIds}
            disabled={disabled}
            leafIdsMap={leafIdsMap}
          />
        ))}
    </>
  );
}
