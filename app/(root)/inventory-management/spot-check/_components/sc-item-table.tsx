"use no memo";

import {
  Controller,
  useFieldArray,
  type UseFormReturn,
  type FieldArrayWithId,
} from "react-hook-form";
import { useMemo } from "react";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LookupProduct } from "@/components/lookup/lookup-product";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import type { SpotCheckFormValues } from "./sc-form-schema";
import { EMPTY_PRODUCT_ITEM } from "./sc-form-schema";

type ProductField = FieldArrayWithId<SpotCheckFormValues, "products", "id">;

interface ScItemTableProps {
  form: UseFormReturn<SpotCheckFormValues>;
  disabled: boolean;
}

export function ScItemTable({ form, disabled }: ScItemTableProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const selectedIds = useMemo(() => {
    return fields.map((f) => f.product_id).filter((id) => id !== "");
  }, [fields]);

  const handleAddItem = () => append({ ...EMPTY_PRODUCT_ITEM });

  const columns = useMemo<ColumnDef<ProductField>[]>(() => {
    const cols: ColumnDef<ProductField>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
        size: 40,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center text-muted-foreground",
        },
      },
      {
        accessorKey: "product_id",
        header: "Product",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`products.${row.index}.product_id`}
            render={({ field }) => (
              <LookupProduct
                value={field.value}
                onValueChange={(value, product) => {
                  field.onChange(value);
                  if (product) {
                    form.setValue(
                      `products.${row.index}.product_name`,
                      product.name,
                    );
                  }
                }}
                disabled={disabled}
                excludeIds={selectedIds}
                className="w-full h-7 text-[11px]"
              />
            )}
          />
        ),
      },
    ];

    if (!disabled) {
      cols.push({
        id: "action",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Remove product"
            onClick={() => remove(row.index)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        ),
        size: 40,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      });
    }

    return cols;
  }, [form, disabled, selectedIds, remove]);

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-2 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Products</h2>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
          >
            <Plus aria-hidden="true" className="size-3.5" />
            Add Product
          </Button>
        )}
      </div>

      <DataGrid
        table={table}
        recordCount={fields.length}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
      </DataGrid>

      {form.formState.errors.products && (
        <p className="text-xs text-destructive">
          {typeof form.formState.errors.products === "object" &&
          "message" in form.formState.errors.products
            ? (form.formState.errors.products as { message?: string }).message
            : "Please select all products"}
        </p>
      )}
    </div>
  );
}
