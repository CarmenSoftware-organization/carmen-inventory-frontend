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
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LookupLocation } from "@/components/lookup/lookup-location";
import { LookupProductInLocation } from "@/components/lookup/lookup-product-in-location";
import { LookupProductUnit } from "@/components/lookup/lookup-product-unit";
import { LookupDeliveryPoint } from "@/components/lookup/lookup-delivery-point";
import { DatePicker } from "@/components/ui/date-picker";
import type { GrnFormValues } from "./grn-form-schema";
import { GrnItemExpand } from "./grn-item-expand";

const INPUT_CLS = "h-6 text-[11px] md:text-[11px] text-right";

/** Watches location_id via useWatch — only re-renders when location changes */
const ProductCell = memo(function ProductCell({
  control,
  form,
  index,
  disabled,
}: {
  control: Control<GrnFormValues>;
  form: UseFormReturn<GrnFormValues>;
  index: number;
  disabled: boolean;
}) {
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
          onValueChange={(value, product) => {
            field.onChange(value);
            if (product) {
              form.setValue(`items.${index}.product_name`, product.name);
            }
            form.setValue(`items.${index}.requested_unit_id`, "");
            form.setValue(`items.${index}.received_unit_id`, "");
            form.setValue(`items.${index}.approved_unit_id`, "");
            form.setValue(`items.${index}.foc_unit_id`, "");
          }}
          disabled={disabled}
          className="w-full text-[11px]"
        />
      )}
    />
  );
});

/** Watches product_id via useWatch — only re-renders when product changes */
const WatchedProductUnit = memo(function WatchedProductUnit({
  control,
  index,
  unitField,
  disabled,
  onExtraChange,
}: {
  control: Control<GrnFormValues>;
  index: number;
  unitField:
    | "requested_unit_id"
    | "received_unit_id"
    | "approved_unit_id"
    | "foc_unit_id";
  disabled: boolean;
  onExtraChange?: (value: string) => void;
}) {
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
});

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
    const expandColumn: ColumnDef<GrnItemField> = {
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
        expandedContent: (item: GrnItemField) => (
          <GrnItemExpand
            item={item}
            form={form}
            disabled={disabled}
            itemFields={itemFields}
          />
        ),
      },
    };

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
              min={0}
              placeholder="Qty"
              className={INPUT_CLS}
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
                form.setValue(`items.${row.index}.received_unit_id`, value);
                form.setValue(`items.${row.index}.approved_unit_id`, value);
                form.setValue(`items.${row.index}.foc_unit_id`, value);
              }}
            />
          </div>
        ),
        size: 110,
      },
      {
        id: "received",
        header: "Received",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <Input
              type="number"
              min={0}
              placeholder="Qty"
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${row.index}.received_qty`, {
                valueAsNumber: true,
              })}
            />
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              unitField="received_unit_id"
              disabled={disabled}
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
              className={INPUT_CLS}
              disabled={disabled}
              {...form.register(`items.${row.index}.approved_qty`, {
                valueAsNumber: true,
              })}
            />
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              unitField="approved_unit_id"
              disabled={disabled}
            />
          </div>
        ),
        size: 110,
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
        accessorKey: "delivery_date",
        header: "Delivery Date",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`items.${row.index}.delivery_date`}
            render={({ field }) => (
              <DatePicker
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full text-[11px]"
                size="xs"
              />
            )}
          />
        ),
        size: 150,
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

    return [
      expandColumn,
      indexColumn,
      ...dataColumns,
      ...(disabled ? [] : [actionColumn]),
    ];
  }, [form, disabled, itemFields, onDelete]);

  const table = useReactTable({
    data: itemFields,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return { table };
}
