"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataGridRowActionsProps {
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
}

export function DataGridRowActions({
  onEdit,
  onDelete,
}: DataGridRowActionsProps) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs" aria-label="Row actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
              <Pencil className="size-3" />
              Edit
            </DropdownMenuItem>
          )}
          {onEdit && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem onClick={onDelete} variant={"destructive"}>
              <Trash2 className="text-destructive" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
