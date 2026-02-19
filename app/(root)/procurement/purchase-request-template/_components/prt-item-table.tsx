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
import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LookupLocation } from "@/components/lookup/lookup-location";
import { LookupProductInLocation } from "@/components/lookup/lookup-product-in-location";
import { LookupProductUnit } from "@/components/lookup/lookup-product-unit";
import { LookupCurrency } from "@/components/lookup/lookup-currency";
import { LookupDeliveryPoint } from "@/components/lookup/lookup-delivery-point";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import type { Product } from "@/types/product";
import type { PrtFormValues } from "./prt-form-schema";

const setProductToItem = (
  form: UseFormReturn<PrtFormValues>,
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
          inventory_unit_id: product.inventory_unit.id,
          inventory_unit_name: product.inventory_unit.name,
          requested_unit_id: product.inventory_unit.id,
          requested_unit_name: product.inventory_unit.name,
          foc_unit_id: product.inventory_unit.id,
          foc_unit_name: product.inventory_unit.name,
        }
      : {
          product_name: "",
          inventory_unit_id: null,
          inventory_unit_name: "",
          requested_unit_id: null,
          requested_unit_name: "",
          foc_unit_id: null,
          foc_unit_name: "",
        }),
  });
};

const ProductCell = ({
  control,
  form,
  index,
  disabled,
}: {
  control: Control<PrtFormValues>;
  form: UseFormReturn<PrtFormValues>;
  index: number;
  disabled: boolean;
}) => {
  const locationId =
    useWatch({ control, name: `items.${index}.location_id` }) ?? "";
  return (
    <Controller
      control={control}
      name={`items.${index}.product_id`}
      render={({ field }) => (
        <LookupProductInLocation
          locationId={locationId}
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

const WatchedProductUnit = ({
  control,
  index,
  unitField,
  disabled,
  onExtraChange,
}: {
  control: Control<PrtFormValues>;
  index: number;
  unitField: "requested_unit_id" | "foc_unit_id";
  disabled: boolean;
  onExtraChange?: (value: string) => void;
}) => {
  const productId =
    useWatch({ control, name: `items.${index}.product_id` }) ?? "";
  return (
    <Controller
      control={control}
      name={`items.${index}.${unitField}`}
      render={({ field }) => (
        <LookupProductUnit
          productId={productId}
          value={field.value ?? ""}
          onValueChange={(value) => {
            field.onChange(value);
            onExtraChange?.(value);
          }}
          disabled={disabled}
          className="w-full text-[11px]"
        />
      )}
    />
  );
};

const AdjustableAmountCell = ({
  control,
  form,
  index,
  disabled,
  toggleField,
  amountField,
}: {
  control: Control<PrtFormValues>;
  form: UseFormReturn<PrtFormValues>;
  index: number;
  disabled: boolean;
  toggleField: "is_tax_adjustment" | "is_discount_adjustment";
  amountField: "tax_amount" | "discount_amount";
}) => {
  const isManual =
    useWatch({ control, name: `items.${index}.${toggleField}` }) ?? false;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <Controller
          control={control}
          name={`items.${index}.${toggleField}`}
          render={({ field }) => (
            <Checkbox
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className="size-3"
            />
          )}
        />
        <span className="text-[10px] text-muted-foreground">Manual</span>
      </div>
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
    </div>
  );
};

export type PrtItemField = FieldArrayWithId<PrtFormValues, "items", "id">;

interface UsePrtItemTableOptions {
  form: UseFormReturn<PrtFormValues>;
  itemFields: PrtItemField[];
  disabled: boolean;
  onDelete: (index: number) => void;
}

export function usePrtItemTable({
  form,
  itemFields,
  disabled,
  onDelete,
}: UsePrtItemTableOptions) {
  const allColumns = useMemo<ColumnDef<PrtItemField>[]>(() => {
    const indexColumn: ColumnDef<PrtItemField> = {
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

    const dataColumns: ColumnDef<PrtItemField>[] = [
      {
        accessorKey: "location_id",
        header: "Location",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`items.${row.index}.location_id`}
            render={({ field }) => (
              <LookupLocation
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full text-[11px]"
              />
            )}
          />
        ),
        size: 180,
      },
      {
        accessorKey: "delivery_point_id",
        header: "Delivery Point",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`items.${row.index}.delivery_point_id`}
            render={({ field }) => (
              <LookupDeliveryPoint
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full text-[11px]"
              />
            )}
          />
        ),
        size: 180,
      },
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
        id: "requested",
        header: "Requested",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
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
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              unitField="requested_unit_id"
              disabled={disabled}
              onExtraChange={(value) => {
                form.setValue(`items.${row.index}.foc_unit_id`, value);
              }}
            />
          </div>
        ),
        size: 110,
      },
      {
        id: "foc",
        header: "FOC",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <Input
              type="number"
              min={0}
              placeholder="Qty"
              className="h-6 text-[11px] md:text-[11px] text-right"
              disabled={disabled}
              {...form.register(`items.${row.index}.foc_qty`, {
                valueAsNumber: true,
              })}
            />
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              unitField="foc_unit_id"
              disabled={disabled}
            />
          </div>
        ),
        size: 110,
      },
      {
        accessorKey: "currency_id",
        header: "Currency",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`items.${row.index}.currency_id`}
            render={({ field }) => (
              <LookupCurrency
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full text-[11px]"
              />
            )}
          />
        ),
        size: 90,
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
    ];

    const actionColumn: ColumnDef<PrtItemField> = {
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
