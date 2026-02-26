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
import type { BusinessUnit } from "@/types/profile";
import type { PrtFormValues } from "./prt-form-schema";
import { usePrtItemTable } from "./prt-item-table";
import { PRT_ITEM } from "./prt-form-schema";
import EmptyComponent from "@/components/empty-component";
import { getDeleteDescription } from "@/lib/form-utils";

interface PrtItemFieldsProps {
  form: UseFormReturn<PrtFormValues>;
  disabled: boolean;
  defaultBu?: BusinessUnit;
}

export function PrtItemFields({
  form,
  disabled,
  defaultBu,
}: PrtItemFieldsProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const handleAddItem = () => {
    appendItem({
      ...PRT_ITEM,
      currency_id: defaultBu?.config?.default_currency_id ?? null,
    });
  };

  const { table } = usePrtItemTable({
    form,
    itemFields,
    disabled,
    onDelete: setDeleteIndex,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold border-b pb-2">
          Items
          {itemFields.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({itemFields.length})
            </span>
          )}
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
        tableClassNames={{ base: "text-[11px]" }}
        emptyMessage={
          <EmptyComponent
            icon={BoxIcon}
            title="No Items Yet"
            description="Add items to this template."
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
