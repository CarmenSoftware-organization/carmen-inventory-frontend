"use no memo";

import {
  Controller,
  useWatch,
  type UseFormReturn,
  type Control,
  type FieldArrayWithId,
} from "react-hook-form";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { memo, useMemo, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LookupProduct } from "@/components/lookup/lookup-product";
import { LookupProductUnit } from "@/components/lookup/lookup-product-unit";
import { formatCurrency } from "@/lib/currency-utils";
import type { WrFormValues } from "./wr-form-schema";

const round2 = (n: number): number =>
  Number(Math.round(Number.parseFloat(n + "e2")) + "e-2");

const ProductCell = memo(function ProductCell({
  control,
  form,
  index,
  disabled,
  hasError,
}: {
  control: Control<WrFormValues>;
  form: UseFormReturn<WrFormValues>;
  index: number;
  disabled: boolean;
  hasError: boolean;
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
              form.setValue(`items.${index}.product_code`, product.code);
              form.setValue(
                `items.${index}.unit_id`,
                product.inventory_unit?.id ?? "",
              );
              form.setValue(
                `items.${index}.unit_name`,
                product.inventory_unit?.name ?? "",
              );
            }
          }}
          disabled={disabled}
          className={`w-full h-6 text-[11px]${hasError ? " ring-1 ring-destructive rounded-md" : ""}`}
        />
      )}
    />
  );
});

const WatchedProductUnit = memo(function WatchedProductUnit({
  control,
  index,
  disabled,
  hasError,
}: {
  control: Control<WrFormValues>;
  index: number;
  disabled: boolean;
  hasError: boolean;
}) {
  const productId =
    useWatch({ control, name: `items.${index}.product_id` }) ?? "";

  return (
    <Controller
      control={control}
      name={`items.${index}.unit_id`}
      render={({ field }) => (
        <LookupProductUnit
          productId={productId}
          value={field.value ?? ""}
          onValueChange={field.onChange}
          disabled={disabled || !productId}
          className={`w-full text-[11px]${hasError ? " ring-1 ring-destructive rounded-md" : ""}`}
        />
      )}
    />
  );
});

const LossValueCell = memo(function LossValueCell({
  control,
  form,
  index,
}: {
  control: Control<WrFormValues>;
  form: UseFormReturn<WrFormValues>;
  index: number;
}) {
  const qty = useWatch({ control, name: `items.${index}.qty` }) ?? 0;
  const unitCost =
    useWatch({ control, name: `items.${index}.unit_cost` }) ?? 0;

  const lossValue = useMemo(() => round2(qty * unitCost), [qty, unitCost]);

  useEffect(() => {
    form.setValue(`items.${index}.unit_cost`, unitCost);
  }, [lossValue, form, index, unitCost]);

  return (
    <span className="text-[11px] tabular-nums">{formatCurrency(lossValue)}</span>
  );
});

export type WrItemField = FieldArrayWithId<WrFormValues, "items", "id">;

interface UseWrItemTableOptions {
  form: UseFormReturn<WrFormValues>;
  itemFields: WrItemField[];
  disabled: boolean;
  onDelete: (index: number) => void;
}

export function useWrItemTable({
  form,
  itemFields,
  disabled,
  onDelete,
}: UseWrItemTableOptions) {
  const allColumns = useMemo<ColumnDef<WrItemField>[]>(() => {
    const indexColumn: ColumnDef<WrItemField> = {
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

    const dataColumns: ColumnDef<WrItemField>[] = [
      {
        accessorKey: "product_id",
        header: "Product",
        cell: ({ row }) => {
          const hasError =
            !!form.formState.errors.items?.[row.index]?.product_id;
          return (
            <ProductCell
              control={form.control}
              form={form}
              index={row.index}
              disabled={disabled}
              hasError={hasError}
            />
          );
        },
        size: 240,
      },
      {
        accessorKey: "qty",
        header: "Qty",
        cell: ({ row }) => {
          const hasError = !!form.formState.errors.items?.[row.index]?.qty;
          return (
            <Input
              type="number"
              min={1}
              placeholder="Qty"
              className={`h-6 text-[11px] md:text-[11px] text-right${hasError ? " ring-1 ring-destructive" : ""}`}
              disabled={disabled}
              {...form.register(`items.${row.index}.qty`, {
                valueAsNumber: true,
              })}
            />
          );
        },
        size: 80,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "unit_id",
        header: "Unit",
        cell: ({ row }) => {
          const hasError = !!form.formState.errors.items?.[row.index]?.unit_id;
          return (
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              disabled={disabled}
              hasError={hasError}
            />
          );
        },
        size: 120,
      },
      {
        accessorKey: "unit_cost",
        header: "Unit Cost",
        cell: ({ row }) => {
          const hasError =
            !!form.formState.errors.items?.[row.index]?.unit_cost;
          return (
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className={`h-6 text-[11px] md:text-[11px] text-right${hasError ? " ring-1 ring-destructive" : ""}`}
              disabled={disabled}
              {...form.register(`items.${row.index}.unit_cost`, {
                valueAsNumber: true,
              })}
            />
          );
        },
        size: 100,
        meta: { headerClassName: "text-right" },
      },
      {
        id: "loss_value",
        header: "Loss Value",
        cell: ({ row }) => (
          <LossValueCell
            control={form.control}
            form={form}
            index={row.index}
          />
        ),
        size: 100,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
      },
    ];

    const actionColumn: ColumnDef<WrItemField> = {
      id: "action",
      header: () => "",
      cell: ({ row }: { row: { index: number } }) => (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          aria-label="Remove item"
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
