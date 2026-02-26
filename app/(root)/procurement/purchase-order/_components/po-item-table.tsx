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
import { memo, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LookupProduct } from "@/components/lookup/lookup-product";
import { LookupProductUnit } from "@/components/lookup/lookup-product-unit";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import type { Product } from "@/types/product";
import type { PoFormValues } from "./po-form-schema";

const setProductToItem = (
  form: UseFormReturn<PoFormValues>,
  index: number,
  value: string,
  product?: Product,
) => {
  const current = form.getValues(`items.${index}`);
  form.setValue(`items.${index}`, {
    ...current,
    product_id: value,
    ...(product
      ? {
          product_name: product.name,
          product_local_name: product.local_name ?? "",
          order_unit_id: product.inventory_unit?.id ?? null,
          order_unit_name: product.inventory_unit?.name ?? "",
          base_unit_id: product.inventory_unit?.id ?? null,
          base_unit_name: product.inventory_unit?.name ?? "",
        }
      : {
          product_name: "",
          product_local_name: "",
          order_unit_id: null,
          order_unit_name: "",
          base_unit_id: null,
          base_unit_name: "",
        }),
  });
};

const ProductCell = memo(function ProductCell({
  control,
  form,
  index,
  disabled,
  hasError,
}: {
  control: Control<PoFormValues>;
  form: UseFormReturn<PoFormValues>;
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
          onValueChange={(value, product) =>
            setProductToItem(form, index, value, product)
          }
          disabled={disabled}
          className={`w-full text-[11px]${hasError ? " ring-1 ring-destructive rounded-md" : ""}`}
        />
      )}
    />
  );
});

const WatchedProductUnit = memo(function WatchedProductUnit({
  control,
  index,
  disabled,
}: {
  control: Control<PoFormValues>;
  index: number;
  disabled: boolean;
}) {
  const productId =
    useWatch({ control, name: `items.${index}.product_id` }) ?? "";
  return (
    <Controller
      control={control}
      name={`items.${index}.order_unit_id`}
      render={({ field }) => (
        <LookupProductUnit
          productId={productId}
          value={field.value ?? ""}
          onValueChange={field.onChange}
          disabled={disabled}
          className="w-full text-[11px]"
        />
      )}
    />
  );
});

const AdjustableAmountCell = memo(function AdjustableAmountCell({
  control,
  form,
  index,
  disabled,
  toggleField,
  amountField,
}: {
  control: Control<PoFormValues>;
  form: UseFormReturn<PoFormValues>;
  index: number;
  disabled: boolean;
  toggleField: "is_tax_adjustment" | "is_discount_adjustment";
  amountField: "tax_amount" | "discount_amount";
}) {
  const isManual =
    useWatch({ control, name: `items.${index}.${toggleField}` }) ?? false;
  return (
    <div className="space-y-0.5">
      <Input
        type="number"
        min={0}
        step="0.01"
        placeholder="0.00"
        className="h-6 text-[11px] md:text-[11px] text-right"
        disabled={disabled || !isManual}
        {...form.register(`items.${index}.${amountField}`, {
          valueAsNumber: true,
        })}
      />
      <label className="flex items-center gap-1 cursor-pointer">
        <Controller
          control={control}
          name={`items.${index}.${toggleField}`}
          render={({ field }) => (
            <Checkbox
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className="size-3.5"
            />
          )}
        />
        <span className="text-sm text-muted-foreground select-none">Manual</span>
      </label>
    </div>
  );
});

export type PoItemField = FieldArrayWithId<PoFormValues, "items", "id">;

interface UsePoItemTableOptions {
  form: UseFormReturn<PoFormValues>;
  itemFields: PoItemField[];
  disabled: boolean;
  onDelete: (index: number) => void;
}

export function usePoItemTable({
  form,
  itemFields,
  disabled,
  onDelete,
}: UsePoItemTableOptions) {
  const allColumns = useMemo<ColumnDef<PoItemField>[]>(() => {
    const indexColumn: ColumnDef<PoItemField> = {
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

    const dataColumns: ColumnDef<PoItemField>[] = [
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
        size: 280,
      },
      {
        id: "order",
        header: "Order Qty",
        cell: ({ row }) => {
          const hasError =
            !!form.formState.errors.items?.[row.index]?.order_qty;
          return (
          <div className="flex flex-col gap-0.5">
            <Input
              type="number"
              min={1}
              placeholder="Qty"
              className={`h-6 text-[11px] md:text-[11px] text-right${hasError ? " ring-1 ring-destructive" : ""}`}
              disabled={disabled}
              {...form.register(`items.${row.index}.order_qty`, {
                valueAsNumber: true,
              })}
            />
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              disabled={disabled}
            />
          </div>
          );
        },
        size: 110,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.price`, {
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
        accessorKey: "tax_profile_id",
        header: "Tax Profile",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`items.${row.index}.tax_profile_id`}
            render={({ field }) => (
              <LookupTaxProfile
                value={field.value ?? ""}
                onValueChange={(value, taxRate) => {
                  field.onChange(value || null);
                  form.setValue(`items.${row.index}.tax_rate`, taxRate);
                }}
                disabled={disabled}
                className="w-full text-[11px]"
              />
            )}
          />
        ),
        size: 140,
      },
      {
        id: "tax_rate",
        header: "Tax %",
        cell: ({ row }) => (
          <Input
            type="number"
            placeholder="0"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled
            {...form.register(`items.${row.index}.tax_rate`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 70,
        meta: {
          headerClassName: "text-right",
        },
      },
      {
        id: "tax_amount",
        header: "Tax Amt",
        cell: ({ row }) => (
          <AdjustableAmountCell
            control={form.control}
            form={form}
            index={row.index}
            disabled={disabled}
            toggleField="is_tax_adjustment"
            amountField="tax_amount"
          />
        ),
        size: 90,
      },
      {
        id: "discount_rate",
        header: "Disc %",
        cell: ({ row }) => (
          <Input
            type="number"
            min={0}
            max={100}
            step="0.01"
            placeholder="0"
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.discount_rate`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 70,
        meta: {
          headerClassName: "text-right",
        },
      },
      {
        id: "discount_amount",
        header: "Disc Amt",
        cell: ({ row }) => (
          <AdjustableAmountCell
            control={form.control}
            form={form}
            index={row.index}
            disabled={disabled}
            toggleField="is_discount_adjustment"
            amountField="discount_amount"
          />
        ),
        size: 90,
      },
      {
        id: "is_foc",
        header: "FOC",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`items.${row.index}.is_foc`}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className="size-4"
              />
            )}
          />
        ),
        size: 40,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
    ];

    const actionColumn: ColumnDef<PoItemField> = {
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
