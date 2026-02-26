"use no memo";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { BoxIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { CnFormValues } from "./cn-form-schema";
import { useCnItemTable } from "./cn-item-table";
import { CN_ITEM } from "./cn-form-schema";
import EmptyComponent from "@/components/empty-component";
import { getDeleteDescription } from "@/lib/form-utils";

interface CnItemFieldsProps {
  form: UseFormReturn<CnFormValues>;
  disabled: boolean;
}

export function CnItemFields({ form, disabled }: CnItemFieldsProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const handleAddItem = () => {
    appendItem({ ...CN_ITEM });
  };

  const { table } = useCnItemTable({
    form,
    itemFields,
    disabled,
    onDelete: setDeleteIndex,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Items{" "}
          <span className="text-muted-foreground font-normal">
            ({itemFields.length})
          </span>
        </h2>
        {!disabled && (
          <Button type="button" size="xs" onClick={handleAddItem}>
            <Plus /> Add Item
          </Button>
        )}
      </div>

      <DataGrid
        table={table}
        recordCount={itemFields.length}
        tableLayout={{ dense: true, headerSeparator: true }}
        tableClassNames={{ base: "text-xs" }}
        emptyMessage={
          <EmptyComponent
            icon={BoxIcon}
            title="No Items Yet"
            description="Add items to this credit note."
            content={
              !disabled && (
                <Button type="button" size="xs" onClick={handleAddItem}>
                  <Plus /> Add Item
                </Button>
              )
            }
          />
        }
      >
        <DataGridContainer>
          <ScrollArea className="w-full pb-4">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
      </DataGrid>

      <DeleteDialog
        open={deleteIndex !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteIndex(null);
        }}
        title="Remove Item"
        description={getDeleteDescription(deleteIndex, form, "item_name")}
        onConfirm={() => {
          if (deleteIndex === null) return;
          removeItem(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
