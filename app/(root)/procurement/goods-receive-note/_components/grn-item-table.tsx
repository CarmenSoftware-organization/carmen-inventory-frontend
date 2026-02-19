"use no memo";

import {
  Controller,
  type UseFormReturn,
  type Control,
  type FieldArrayWithId,
} from "react-hook-form";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LookupProduct } from "@/components/lookup/lookup-product";
import type { Product } from "@/types/product";
import type { GrnFormValues } from "./grn-form-schema";

const setProductToItem = (
  form: UseFormReturn<GrnFormValues>,
  index: number,
  value: string,
  product?: Product,
) => {
  const current = form.getValues(`items.${index}`);
  form.setValue(`items.${index}`, {
    ...current,
    item_id: value,
    item_name: product?.name ?? "",
  });
};

const ProductCell = ({
  control,
  form,
  index,
  disabled,
}: {
  control: Control<GrnFormValues>;
  form: UseFormReturn<GrnFormValues>;
  index: number;
  disabled: boolean;
}) => {
  return (
    <Controller
      control={control}
      name={`items.${index}.item_id`}
      render={({ field }) => (
        <LookupProduct
          value={field.value ?? ""}
          onValueChange={(value, product) =>
            setProductToItem(form, index, value, product)
          }
          disabled={disabled}
          className="w-full text-[11px]"
        />
      )}
    />
  );
};

export type GrnItemField = FieldArrayWithId<GrnFormValues, "items", "id">;

interface UseGrnItemTableOptions {
  form: UseFormReturn<GrnFormValues>;
  itemFields: GrnItemField[];
  disabled: boolean;
  onDelete: (index: number) => void;
}

export function useGrnItemTable({
  form,
  itemFields,
  disabled,
  onDelete,
}: UseGrnItemTableOptions) {
  const allColumns = useMemo<ColumnDef<GrnItemField>[]>(() => {
    const indexColumn: ColumnDef<GrnItemField> = {
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      size: 32,
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    };

    const dataColumns: ColumnDef<GrnItemField>[] = [
      {
        accessorKey: "item_id",
        header: "Product",
        cell: ({ row }) => (
          <ProductCell
            control={form.control}
            form={form}
            index={row.index}
            disabled={disabled}
          />
        ),
        size: 280,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <Input
            type="number"
            min={1}
            placeholder="Qty"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.quantity`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 100,
        meta: {
          headerClassName: "text-right",
        },
      },
      {
        accessorKey: "unit_price",
        header: "Unit Price",
        cell: ({ row }) => (
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.unit_price`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 120,
        meta: {
          headerClassName: "text-right",
        },
      },
    ];

    const actionColumn: ColumnDef<GrnItemField> = {
      id: "action",
      header: () => "",
      cell: ({ row }: { row: { index: number } }) => (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => onDelete(row.index)}
        >
          <Trash2 />
        </Button>
      ),
      enableSorting: false,
      size: 40,
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
    };

    return [indexColumn, ...dataColumns, ...(disabled ? [] : [actionColumn])];
  }, [form, disabled, onDelete]);

  const table = useReactTable({
    data: itemFields,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return { table };
}
