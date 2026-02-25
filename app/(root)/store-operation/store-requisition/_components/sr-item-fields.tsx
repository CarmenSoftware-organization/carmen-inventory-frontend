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
import EmptyComponent from "@/components/empty-component";
import type { SrFormValues } from "./sr-form-schema";
import { SR_ITEM } from "./sr-form-schema";
import { useSrItemTable } from "./sr-item-table";
import { getDeleteDescription } from "@/lib/form-utils";

interface SrItemFieldsProps {
  form: UseFormReturn<SrFormValues>;
  disabled: boolean;
}

export function SrItemFields({ form, disabled }: SrItemFieldsProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const handleAddItem = () => {
    appendItem({ ...SR_ITEM });
  };

  const { table } = useSrItemTable({
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
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
        emptyMessage={
          <EmptyComponent
            icon={BoxIcon}
            title="No Items Yet"
            description="Add items to this store requisition."
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
          <DataGridTable />
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
