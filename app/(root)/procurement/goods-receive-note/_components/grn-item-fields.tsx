"use no memo";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { BoxIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { GrnFormValues } from "./grn-form-schema";
import { useGrnItemTable } from "./grn-item-table";
import { GRN_ITEM } from "./grn-form-schema";
import EmptyComponent from "@/components/empty-component";

function getDeleteDescription(
  index: number | null,
  form: UseFormReturn<GrnFormValues>,
) {
  if (index === null) return "";
  const name = form.getValues(`items.${index}.item_name`);
  const label = name || `Item #${index + 1}`;
  return `Are you sure you want to remove "${label}"?`;
}

interface GrnItemFieldsProps {
  form: UseFormReturn<GrnFormValues>;
  disabled: boolean;
}

export function GrnItemFields({ form, disabled }: GrnItemFieldsProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const handleAddItem = () => {
    appendItem({ ...GRN_ITEM });
  };

  const { table } = useGrnItemTable({
    form,
    itemFields,
    disabled,
    onDelete: setDeleteIndex,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Items</h2>
        {!disabled && (
          <Button type="button" size="xs" onClick={handleAddItem}>
            <Plus /> Add Item
          </Button>
        )}
      </div>

      <DataGrid
        table={table}
        recordCount={itemFields.length}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-[11px]" }}
        emptyMessage={
          <EmptyComponent
            icon={BoxIcon}
            title="No Items Yet"
            description="Add items to this goods receive note."
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
        description={getDeleteDescription(deleteIndex, form)}
        onConfirm={() => {
          if (deleteIndex === null) return;
          removeItem(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
