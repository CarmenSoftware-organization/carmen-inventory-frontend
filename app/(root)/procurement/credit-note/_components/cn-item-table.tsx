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
import type { CnFormValues } from "./cn-form-schema";

const setProductToItem = (
  form: UseFormReturn<CnFormValues>,
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
  control: Control<CnFormValues>;
  form: UseFormReturn<CnFormValues>;
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
          size="xs"
        />
      )}
    />
  );
};

export type CnItemField = FieldArrayWithId<CnFormValues, "items", "id">;

interface UseCnItemTableOptions {
  form: UseFormReturn<CnFormValues>;
  itemFields: CnItemField[];
  disabled: boolean;
  onDelete: (index: number) => void;
}

export function useCnItemTable({
  form,
  itemFields,
  disabled,
  onDelete,
}: UseCnItemTableOptions) {
  const allColumns = useMemo<ColumnDef<CnItemField>[]>(() => {
    const indexColumn: ColumnDef<CnItemField> = {
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

    const dataColumns: ColumnDef<CnItemField>[] = [
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

    const actionColumn: ColumnDef<CnItemField> = {
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
