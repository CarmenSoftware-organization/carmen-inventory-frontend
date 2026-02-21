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
import { memo, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LookupProduct } from "@/components/lookup/lookup-product";
import type { SrFormValues } from "./sr-form-schema";
import { Badge } from "@/components/ui/badge";

const ProductCell = memo(function ProductCell({
  control,
  form,
  index,
  disabled,
}: {
  control: Control<SrFormValues>;
  form: UseFormReturn<SrFormValues>;
  index: number;
  disabled: boolean;
}) {
  return (
    <Controller
      control={control}
      name={`items.${index}.product_id`}
      render={({ field }) => (
        <LookupProduct
          value={field.value ?? ""}
          onValueChange={(value, product) => {
            field.onChange(value);
            if (product) {
              form.setValue(`items.${index}.product_name`, product.name);
            }
          }}
          disabled={disabled}
          className="w-full h-6 text-[11px]"
        />
      )}
    />
  );
});

export type SrItemField = FieldArrayWithId<SrFormValues, "items", "id">;

interface UseSrItemTableOptions {
  form: UseFormReturn<SrFormValues>;
  itemFields: SrItemField[];
  disabled: boolean;
  onDelete: (index: number) => void;
}

export function useSrItemTable({
  form,
  itemFields,
  disabled,
  onDelete,
}: UseSrItemTableOptions) {
  const allColumns = useMemo<ColumnDef<SrItemField>[]>(() => {
    const indexColumn: ColumnDef<SrItemField> = {
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

    const dataColumns: ColumnDef<SrItemField>[] = [
      {
        accessorKey: "product_id",
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
        accessorKey: "requested_qty",
        header: "Requested Qty",
        cell: ({ row }) => (
          <Input
            type="number"
            min={1}
            placeholder="Qty"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.requested_qty`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 100,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "approved_qty",
        header: "Approved Qty",
        cell: ({ row }) => (
          <Input
            type="number"
            min={0}
            placeholder="Qty"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.approved_qty`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 100,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "issued_qty",
        header: "Issued Qty",
        cell: ({ row }) => (
          <Input
            type="number"
            min={0}
            placeholder="Qty"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.issued_qty`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 100,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "current_stage_status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-[11px] capitalize">
            {row.original.current_stage_status}
          </Badge>
        ),
        size: 100,
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
      },
    ];

    const actionColumn: ColumnDef<SrItemField> = {
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
