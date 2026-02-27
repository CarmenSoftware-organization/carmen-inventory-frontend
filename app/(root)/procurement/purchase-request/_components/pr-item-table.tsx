"use no memo";

import {
  Controller,
  useWatch,
  type UseFormReturn,
  type Control,
  type FieldArrayWithId,
} from "react-hook-form";
import { formatCurrency } from "@/lib/currency-utils";
import {
  type ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { memo, useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DataGridTableRowSelect } from "@/components/ui/data-grid/data-grid-table";
import { DatePicker } from "@/components/ui/date-picker";
import { LookupProductInLocation } from "@/components/lookup/lookup-product-in-location";
import { LookupProductUnit } from "@/components/lookup/lookup-product-unit";
import { LookupCurrency } from "@/components/lookup/lookup-currency";
import { LookupDeliveryPoint } from "@/components/lookup/lookup-delivery-point";
import { PR_ITEM_STATUS_CONFIG } from "@/constant/purchase-request";
import type { PrFormValues } from "./pr-form-schema";
import { PrItemExpand } from "./pr-item-expand";
import { Badge } from "@/components/ui/badge";
import { LookupUserLocation } from "@/components/lookup/lookup-user-location";

const StatusCell = memo(function StatusCell({
  control,
  index,
}: {
  control: Control<PrFormValues>;
  index: number;
}) {
  const status =
    useWatch({ control, name: `items.${index}.current_stage_status` }) ||
    "pending";
  const { variant, label } =
    PR_ITEM_STATUS_CONFIG[status] ?? PR_ITEM_STATUS_CONFIG.pending;
  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  );
});

const AmountCell = memo(function AmountCell({
  control,
  index,
}: {
  control: Control<PrFormValues>;
  index: number;
}) {
  const totalPrice =
    useWatch({ control, name: `items.${index}.total_price` }) ?? 0;
  return (
    <span className="tabular-nums font-medium">
      {formatCurrency(Number(totalPrice))}
    </span>
  );
});

/** Watches location_id via useWatch — only re-renders when location changes, not on every form change */
const ProductCell = memo(function ProductCell({
  control,
  form,
  index,
  isDisabled,
}: {
  control: Control<PrFormValues>;
  form: UseFormReturn<PrFormValues>;
  index: number;
  isDisabled: boolean;
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
          disabled={isDisabled}
          className="w-full h-7 text-xs"
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
          className="w-full h-7 text-xs"
        />
      )}
    />
  );
});

export type ItemField = FieldArrayWithId<PrFormValues, "items", "id">;

interface UsePrItemTableOptions {
  form: UseFormReturn<PrFormValues>;
  itemFields: ItemField[];
  isDisabled: boolean;
  prStatus?: string;
  role?: string;
  dateFormat: string;
  buCode?: string;
  onDelete: (index: number) => void;
}

export function usePrItemTable({
  form,
  itemFields,
  isDisabled,
  prStatus,
  role,
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
  const isCreateDisabled = isDisabled || role !== "create";

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
            disabled={isDisabled}
          />
        );
      },
      cell: ({ row }) => (
        <DataGridTableRowSelect row={row} disabled={isDisabled} />
      ),
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
          aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
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
            disabled={isDisabled || role !== "purchase"}
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
              <LookupUserLocation
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={isCreateDisabled}
                className="w-full h-7 text-xs"
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
            isDisabled={isCreateDisabled}
          />
        ),
        size: 350,
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
              className="h-7 text-xs text-right"
              disabled={isCreateDisabled}
              {...form.register(`items.${row.index}.requested_qty`, {
                valueAsNumber: true,
              })}
            />
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              unitField="requested_unit_id"
              disabled={isCreateDisabled}
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
              className="h-7 text-xs text-right"
              disabled={isDisabled}
              {...form.register(`items.${row.index}.approved_qty`, {
                valueAsNumber: true,
              })}
            />
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              unitField="approved_unit_id"
              disabled={isDisabled}
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
              className="h-7 text-xs text-right"
              disabled={isDisabled}
              {...form.register(`items.${row.index}.foc_qty`, {
                valueAsNumber: true,
              })}
            />
            <WatchedProductUnit
              control={form.control}
              index={row.index}
              unitField="foc_unit_id"
              disabled={isDisabled}
            />
          </div>
        ),
        size: 110,
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <AmountCell control={form.control} index={row.index} />
        ),
        size: 80,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
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
                disabled={isDisabled}
                className="w-full text-xs"
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
                disabled={isDisabled}
                className="w-full h-7 text-xs"
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
                value={field.value}
                onValueChange={field.onChange}
                fromDate={today}
                disabled={isDisabled}
                className="w-full text-xs"
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
    const hiddenInDraft = new Set(["foc", "approved", "amount"]);

    return [
      ...(isDraft ? [] : [expandColumn]),
      ...(isDraft ? [] : [prSelectColumn]),
      indexColumn,
      ...(isDraft
        ? dataColumns.filter((col) => !hiddenInDraft.has(col.id ?? ""))
        : dataColumns),
      ...(isDisabled ? [] : [actionColumn]),
    ];
  }, [
    form,
    isDisabled,
    prStatus,
    role,
    buCode,
    itemFields,
    onDelete,
    setSelectDialogOpen,
    today,
  ]);

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
    const selection: Record<string, boolean> = {};
    for (let i = 0; i < itemFields.length; i++) {
      const status = form.getValues(`items.${i}.current_stage_status`);
      if (!status || status === "pending") {
        selection[i] = true;
      }
    }
    table.setRowSelection(selection);
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
