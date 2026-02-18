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
import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DataGridTableRowSelect } from "@/components/ui/data-grid/data-grid-table";
import { formatDate } from "@/lib/date-utils";
import { DatePicker } from "@/components/ui/date-picker";
import { LookupLocation } from "@/components/lookup/lookup-location";
import { LookupProductInLocation } from "@/components/lookup/lookup-product-in-location";
import { LookupProductUnit } from "@/components/lookup/lookup-product-unit";
import { LookupCurrency } from "@/components/lookup/lookup-currency";
import { LookupDeliveryPoint } from "@/components/lookup/lookup-delivery-point";
import { PR_ITEM_STATUS_CONFIG } from "@/constant/purchase-request";
import type { PrFormValues } from "./pr-form-schema";
import { PrItemExpand } from "./pr-item-expand";
import { Badge } from "@/components/ui/badge";

function StatusCell({
  control,
  index,
}: {
  control: Control<PrFormValues>;
  index: number;
}) {
  const status =
    useWatch({ control, name: `items.${index}.current_stage_status` }) ||
    "pending";
  const { variant, label } = PR_ITEM_STATUS_CONFIG[status] ?? PR_ITEM_STATUS_CONFIG.pending;
  return (
    <Badge variant={variant} className="text-[11px]">
      {label}
    </Badge>
  );
}

/** Watches location_id via useWatch — only re-renders when location changes, not on every form change */
function ProductCell({
  control,
  form,
  index,
  disabled,
}: {
  control: Control<PrFormValues>;
  form: UseFormReturn<PrFormValues>;
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
            form.setValue(`items.${index}.foc_unit_id`, "");
            form.setValue(`items.${index}.approved_unit_id`, "");
          }}
          disabled={disabled}
          className="w-full text-[11px]"
          size="xs"
        />
      )}
    />
  );
}

/** Watches product_id via useWatch — only re-renders when product changes */
function WatchedProductUnit({
  control,
  index,
  unitField,
  disabled,
  onExtraChange,
}: {
  control: Control<PrFormValues>;
  index: number;
  unitField: "requested_unit_id" | "approved_unit_id" | "foc_unit_id";
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
          size="xs"
        />
      )}
    />
  );
}

export type ItemField = FieldArrayWithId<PrFormValues, "items", "id">;

interface UsePrItemTableOptions {
  form: UseFormReturn<PrFormValues>;
  itemFields: ItemField[];
  disabled: boolean;
  prStatus?: string;
  dateFormat: string;
  buCode?: string;
  onDelete: (index: number) => void;
}

export function usePrItemTable({
  form,
  itemFields,
  disabled,
  prStatus,
  dateFormat,
  buCode,
  onDelete,
}: UsePrItemTableOptions) {
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);

  const allCount = itemFields.length;
  const pendingCount = itemFields.filter((_, index) => {
    const status = form.getValues(`items.${index}.current_stage_status`);
    return !status || status === "pending";
  }).length;

  // Stable reference for DatePicker fromDate — avoids new Date() on every cell render
  const today = useMemo(() => new Date(), []);

  // Memoize all columns — prevents React Table from rebuilding table structure on every render.
  // Only rebuilds when form mode (disabled), status (prStatus), or items change.
  const allColumns = useMemo<ColumnDef<ItemField>[]>(() => {
    const prSelectColumn: ColumnDef<ItemField> = {
      id: "select",
      header: ({ table: t }) => {
        const isAllSelected = t.getIsAllPageRowsSelected();
        const isSomeSelected = t.getIsSomePageRowsSelected();
        return (
          <Checkbox
            checked={
              isSomeSelected && !isAllSelected ? "indeterminate" : isAllSelected
            }
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectDialogOpen(true);
              } else {
                t.toggleAllPageRowsSelected(false);
              }
            }}
            aria-label="Select all"
            className="align-[inherit]"
          />
        );
      },
      cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      enableSorting: false,
      enableHiding: false,
      size: 30,
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    };

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
            buCode={buCode}
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
        accessorKey: "current_stage_status",
        header: "Status",
        cell: ({ row }) => (
          <StatusCell control={form.control} index={row.index} />
        ),
        size: 100,
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
                form.setValue(`items.${row.index}.approved_unit_id`, value);
              }}
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
              className="h-6 text-[11px] md:text-[11px] text-right"
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
                  fromDate={today}
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

    return [
      expandColumn,
      prSelectColumn,
      indexColumn,
      ...(isDraft
        ? dataColumns.filter((col) => !hiddenInDraft.has(col.id ?? ""))
        : dataColumns),
      ...(!disabled ? [actionColumn] : []),
    ];
  }, [form, disabled, prStatus, dateFormat, buCode, itemFields, onDelete, setSelectDialogOpen, today]);

  const table = useReactTable({
    data: itemFields,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true,
  });

  const handleSelectAll = () => {
    table.toggleAllPageRowsSelected(true);
    setSelectDialogOpen(false);
  };

  const handleSelectPending = () => {
    table.resetRowSelection();
    itemFields.forEach((_item: ItemField, index: number) => {
      const status = form.getValues(`items.${index}.current_stage_status`);
      if (!status || status === "pending") {
        table.getRowModel().rows[index]?.toggleSelected(true);
      }
    });
    setSelectDialogOpen(false);
  };

  return {
    table,
    selectDialogOpen,
    setSelectDialogOpen,
    allCount,
    pendingCount,
    handleSelectAll,
    handleSelectPending,
  };
}
