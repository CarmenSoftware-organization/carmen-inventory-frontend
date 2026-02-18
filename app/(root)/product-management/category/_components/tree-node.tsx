"use client";

import {
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Folder,
  FolderOpen,
  Layers,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_TYPE, type CategoryNode } from "@/types/category";
import { Badge } from "@/components/ui/badge";

interface TreeNodeProps {
  readonly node: CategoryNode;
  readonly level?: number;
  readonly expanded: Record<string, boolean>;
  readonly toggleExpand: (id: string) => void;
  readonly onEdit: (node: CategoryNode) => void;
  readonly onAdd: (parentNode: CategoryNode) => void;
  readonly onDelete: (node: CategoryNode) => void;
  readonly search?: string;
}

export function TreeNode({
  node,
  level = 0,
  expanded,
  toggleExpand,
  onEdit,
  onAdd,
  onDelete,
  search,
}: TreeNodeProps) {
  const isExpanded = expanded[node.id] ?? false;
  const hasChildren = !!node.children?.length;

  const highlight = (text: string): React.ReactNode => {
    if (!search || !text) return text;
    const escaped = search.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    if (parts.length === 1) return text;
    let offset = 0;
    return parts.map((part) => {
      const key = offset;
      offset += part.length;
      return regex.test(part) ? (
        <mark
          key={key}
          className="bg-yellow-200/80 dark:bg-yellow-800/40 rounded-sm px-px"
        >
          {part}
        </mark>
      ) : (
        <span key={key}>{part}</span>
      );
    });
  };

  const iconCls = "h-3 w-3 text-muted-foreground/60 shrink-0";

  const getNodeIcon = () => {
    if (node.type === NODE_TYPE.ITEM_GROUP) return <Box className={iconCls} />;
    if (node.type === NODE_TYPE.SUBCATEGORY)
      return <Layers className={iconCls} />;
    if (isExpanded) return <FolderOpen className={iconCls} />;
    return <Folder className={iconCls} />;
  };

  return (
    <div className="select-none">
      {/* Tree line connector */}
      <div
        className={cn(
          "group/node flex items-center h-7 hover:bg-accent/50 transition-colors border-b border-transparent hover:border-border/30",
        )}
        style={{ paddingLeft: `${level * 20 + 4}px` }}
      >
        {/* Expand toggle */}
        <button
          type="button"
          className="flex items-center justify-center w-4 h-4 shrink-0"
          onClick={() => hasChildren && toggleExpand(node.id)}
        >
          {hasChildren ? (
            <ChevronRight
              className={cn(
                "h-3 w-3 text-muted-foreground transition-transform duration-150",
                isExpanded && "rotate-90",
              )}
            />
          ) : (
            <span className="w-3" />
          )}
        </button>

        {/* Node icon */}
        <div className="flex items-center gap-1.5 ml-1 mr-1.5">
          {getNodeIcon()}
        </div>

        {/* Content - clickable for expand */}
        <button
          type="button"
          className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
          onClick={() => toggleExpand(node.id)}
        >
          <Badge variant={"secondary"} className="text-[10px] h-5 shrink-0">
            {highlight(node.code)}
          </Badge>

          <span className="text-xs font-medium truncate">
            {highlight(node.name)}
          </span>

          {node.description && (
            <span className="text-[11px] text-muted-foreground/60 truncate hidden xl:inline">
              — {highlight(node.description)}
            </span>
          )}
        </button>

        {/* Status indicator */}
        {!node.is_active && (
          <span className="text-[10px] px-1 py-px rounded bg-red-50 text-red-500 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 mr-1">
            Inactive
          </span>
        )}

        {/* Child count */}
        {hasChildren && (
          <span className="text-[10px] text-muted-foreground/50 tabular-nums mr-1">
            {node.children?.length}
          </span>
        )}

        {/* Actions - visible on hover */}
        <div className="hidden items-center group-hover/node:flex ml-auto pr-1">
          {node.type !== NODE_TYPE.ITEM_GROUP && (
            <button
              type="button"
              className="p-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => onAdd(node)}
              title="Add child"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            className="p-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onEdit(node)}
            title="Edit"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => onDelete(node)}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical tree line */}
          <div
            className="absolute top-0 bottom-0 border-l border-border/40"
            style={{ left: `${level * 20 + 12}px` }}
          />
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onEdit={onEdit}
              onAdd={onAdd}
              onDelete={onDelete}
              search={search}
            />
          ))}
        </div>
      )}
    </div>
  );
}
