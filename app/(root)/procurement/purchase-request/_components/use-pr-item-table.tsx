"use no memo";

import {
  Controller,
  type UseFormReturn,
  type FieldArrayWithId,
} from "react-hook-form";
import {
  type ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { selectColumn } from "@/lib/data-grid/columns";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import { DatePicker } from "@/components/ui/date-picker";
import { LookupLocation } from "@/components/lookup/lookup-location";
import { LookupProductInLocation } from "@/components/lookup/lookup-product-in-location";
import { LookupProductUnit } from "@/components/lookup/lookup-product-unit";
import { LookupCurrency } from "@/components/lookup/lookup-currency";
import { LookupDeliveryPoint } from "@/components/lookup/lookup-delivery-point";
import type { PrFormValues } from "./pr-form-schema";
import { PrItemExpand } from "./pr-item-expand";

export type ItemField = FieldArrayWithId<PrFormValues, "items", "id">;

interface UsePrItemTableOptions {
  form: UseFormReturn<PrFormValues>;
  itemFields: ItemField[];
  disabled: boolean;
  prStatus?: string;
  onDelete: (index: number) => void;
}

export function usePrItemTable({
  form,
  itemFields,
  disabled,
  prStatus,
  onDelete,
}: UsePrItemTableOptions) {
  const { dateFormat } = useProfile();

  const expandColumn: ColumnDef<ItemField> = {
    id: "expand",
    header: "",
    cell: ({ row }) => (
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => row.toggleExpanded()}
      >
        {row.getIsExpanded() ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronRight className="size-3.5" />
        )}
      </Button>
    ),
    enableSorting: false,
    size: 28,
    meta: {
      headerClassName: "text-center",
      cellClassName: "text-center",
      expandedContent: (item: ItemField) => (
        <PrItemExpand
          item={item}
          form={form}
          disabled={disabled}
          itemFields={itemFields}
        />
      ),
    },
  };

  const indexColumn: ColumnDef<ItemField> = {
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

  const dataColumns: ColumnDef<ItemField>[] = [
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
              size="xs"
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
        <Controller
          control={form.control}
          name={`items.${row.index}.product_id`}
          render={({ field }) => (
            <LookupProductInLocation
              locationId={form.watch(`items.${row.index}.location_id`) ?? ""}
              value={field.value ?? ""}
              onValueChange={(value, product) => {
                field.onChange(value);
                if (product) {
                  form.setValue(
                    `items.${row.index}.product_name`,
                    product.name,
                  );
                }
                // Reset units so LookupProductUnit auto-inits with new product's first unit
                form.setValue(`items.${row.index}.requested_unit_id`, "");
                form.setValue(`items.${row.index}.foc_unit_id`, "");
                form.setValue(`items.${row.index}.approved_unit_id`, "");
              }}
              disabled={disabled}
              className="w-full text-[11px]"
              size="xs"
            />
          )}
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
            className="h-6 text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.requested_qty`, {
              valueAsNumber: true,
            })}
          />
          <Controller
            control={form.control}
            name={`items.${row.index}.requested_unit_id`}
            render={({ field }) => (
              <LookupProductUnit
                productId={form.watch(`items.${row.index}.product_id`) ?? ""}
                value={field.value ?? ""}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue(`items.${row.index}.foc_unit_id`, value);
                  form.setValue(`items.${row.index}.approved_unit_id`, value);
                }}
                disabled={disabled}
                className="w-full text-[11px]"
                size="xs"
              />
            )}
          />
        </div>
      ),
      size: 110,
    },
    {
      id: "approved",
      header: "Approved",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <Input
            type="number"
            min={0}
            placeholder="Qty"
            className="h-6 text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.approved_qty`, {
              valueAsNumber: true,
            })}
          />
          <Controller
            control={form.control}
            name={`items.${row.index}.approved_unit_id`}
            render={({ field }) => (
              <LookupProductUnit
                productId={form.watch(`items.${row.index}.product_id`) ?? ""}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full text-[11px]"
                size="xs"
              />
            )}
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
            className="h-6 text-[11px] text-right"
            disabled={disabled}
            {...form.register(`items.${row.index}.foc_qty`, {
              valueAsNumber: true,
            })}
          />
          <Controller
            control={form.control}
            name={`items.${row.index}.foc_unit_id`}
            render={({ field }) => (
              <LookupProductUnit
                productId={form.watch(`items.${row.index}.product_id`) ?? ""}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full text-[11px]"
                size="xs"
              />
            )}
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
              size="xs"
            />
          )}
        />
      ),
      size: 90,
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
              size="xs"
            />
          )}
        />
      ),
      size: 180,
    },
    {
      accessorKey: "delivery_date",
      header: "Delivery Date",
      cell: ({ row }) =>
        disabled ? (
          <span className="text-[11px]">
            {form.getValues(`items.${row.index}.delivery_date`)
              ? formatDate(
                  form.getValues(`items.${row.index}.delivery_date`),
                  dateFormat,
                )
              : "—"}
          </span>
        ) : (
          <Controller
            control={form.control}
            name={`items.${row.index}.delivery_date`}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onValueChange={field.onChange}
                fromDate={new Date()}
                className="w-full text-[11px]"
                size="xs"
              />
            )}
          />
        ),
      size: 150,
    },
  ];

  const actionColumn: ColumnDef<ItemField> = {
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

  const isDraft = !prStatus || prStatus === "draft";
  const hiddenInDraft = new Set(["foc", "approved"]);

  const allColumns: ColumnDef<ItemField>[] = [
    expandColumn,
    selectColumn<ItemField>(),
    indexColumn,
    ...(isDraft
      ? dataColumns.filter((col) => !hiddenInDraft.has(col.id ?? ""))
      : dataColumns),
    ...(!disabled ? [actionColumn] : []),
  ];

  return useReactTable({
    data: itemFields,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true,
  });
}
