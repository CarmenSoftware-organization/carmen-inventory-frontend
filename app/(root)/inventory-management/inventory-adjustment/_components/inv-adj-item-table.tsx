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
import { LookupLocation } from "@/components/lookup/lookup-location";
import type { AdjFormValues } from "./inv-adj-form-schema";

const ProductCell = memo(function ProductCell({
  control,
  form,
  index,
  disabled,
  hasError,
  excludeIds,
}: {
  control: Control<AdjFormValues>;
  form: UseFormReturn<AdjFormValues>;
  index: number;
  disabled: boolean;
  hasError: boolean;
  excludeIds?: string[];
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
              form.setValue(
                `items.${index}.product_local_name`,
                product.local_name ?? "",
              );
            }
          }}
          disabled={disabled}
          excludeIds={excludeIds}
          className={`w-full h-6 text-[11px]${hasError ? " ring-1 ring-destructive rounded-md" : ""}`}
        />
      )}
    />
  );
});

const LocationCell = memo(function LocationCell({
  control,
  form,
  index,
  disabled,
  hasError,
}: {
  control: Control<AdjFormValues>;
  form: UseFormReturn<AdjFormValues>;
  index: number;
  disabled: boolean;
  hasError: boolean;
}) {
  return (
    <Controller
      control={control}
      name={`items.${index}.location_id`}
      render={({ field }) => (
        <LookupLocation
          value={field.value ?? ""}
          onValueChange={(value) => {
            field.onChange(value);
          }}
          disabled={disabled}
          className={`w-full h-6 text-[11px]${hasError ? " ring-1 ring-destructive rounded-md" : ""}`}
        />
      )}
    />
  );
});

export type AdjItemField = FieldArrayWithId<AdjFormValues, "items", "id">;

interface UseAdjItemTableOptions {
  form: UseFormReturn<AdjFormValues>;
  itemFields: AdjItemField[];
  disabled: boolean;
  onDelete: (index: number) => void;
}

export function useAdjItemTable({
  form,
  itemFields,
  disabled,
  onDelete,
}: UseAdjItemTableOptions) {
  const recalcTotal = (index: number, field: "qty" | "cost_per_unit", newValue: number) => {
    const qty = field === "qty" ? newValue : form.getValues(`items.${index}.qty`);
    const cost = field === "cost_per_unit" ? newValue : form.getValues(`items.${index}.cost_per_unit`);
    form.setValue(`items.${index}.total_cost`, qty * cost);
  };

  const allColumns = useMemo<ColumnDef<AdjItemField>[]>(() => {
    const indexColumn: ColumnDef<AdjItemField> = {
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

    const dataColumns: ColumnDef<AdjItemField>[] = [
      {
        accessorKey: "product_id",
        header: "Product",
        cell: ({ row }) => {
          const hasError =
            !!form.formState.errors.items?.[row.index]?.product_id;
          const selectedIds = form
            .getValues("items")
            .map((item, i) => (i !== row.index ? item.product_id : ""))
            .filter(Boolean);
          return (
            <ProductCell
              control={form.control}
              form={form}
              index={row.index}
              disabled={disabled}
              hasError={hasError}
              excludeIds={selectedIds}
            />
          );
        },
        size: 220,
      },
      {
        accessorKey: "location_id",
        header: "Location",
        cell: ({ row }) => {
          const hasError =
            !!form.formState.errors.items?.[row.index]?.location_id;
          return (
            <LocationCell
              control={form.control}
              form={form}
              index={row.index}
              disabled={disabled}
              hasError={hasError}
            />
          );
        },
        size: 180,
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
                onChange: (e) =>
                  recalcTotal(row.index, "qty", Number(e.target.value) || 0),
              })}
            />
          );
        },
        size: 80,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "cost_per_unit",
        header: "Cost/Unit",
        cell: ({ row }) => {
          const hasError =
            !!form.formState.errors.items?.[row.index]?.cost_per_unit;
          return (
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              className={`h-6 text-[11px] md:text-[11px] text-right${hasError ? " ring-1 ring-destructive" : ""}`}
              disabled={disabled}
              {...form.register(`items.${row.index}.cost_per_unit`, {
                valueAsNumber: true,
                onChange: (e) =>
                  recalcTotal(
                    row.index,
                    "cost_per_unit",
                    Number(e.target.value) || 0,
                  ),
              })}
            />
          );
        },
        size: 100,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "total_cost",
        header: "Total Cost",
        cell: ({ row }) => (
          <Input
            type="number"
            className="h-6 text-[11px] md:text-[11px] text-right bg-muted"
            disabled
            {...form.register(`items.${row.index}.total_cost`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 100,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <Input
            placeholder="Optional"
            className="h-6 text-[11px] md:text-[11px]"
            disabled={disabled}
            {...form.register(`items.${row.index}.description`)}
          />
        ),
        size: 150,
      },
    ];

    const actionColumn: ColumnDef<AdjItemField> = {
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
  }, [form, disabled, onDelete, recalcTotal]);

  const table = useReactTable({
    data: itemFields,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return { table };
}
