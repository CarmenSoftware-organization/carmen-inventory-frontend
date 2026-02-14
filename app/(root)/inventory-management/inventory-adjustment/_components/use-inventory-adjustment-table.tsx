"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import {
  selectColumn,
  indexColumn,
  actionColumn,
  columnSkeletons,
} from "@/lib/data-grid/columns";
import { Badge } from "@/components/reui/badge";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import type {
  InventoryAdjustment,
  InventoryAdjustmentType,
  InventoryAdjustmentStatus,
} from "@/types/inventory-adjustment";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseInventoryAdjustmentTableOptions {
  items: InventoryAdjustment[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (item: InventoryAdjustment) => void;
  onDelete: (item: InventoryAdjustment) => void;
}

const typeVariantMap: Record<InventoryAdjustmentType, "info" | "warning"> = {
  "stock-in": "info",
  "stock-out": "warning",
};

const statusVariantMap: Record<
  InventoryAdjustmentStatus,
  "outline" | "success"
> = {
  in_progress: "outline",
  completed: "success",
};

const statusLabelMap: Record<InventoryAdjustmentStatus, string> = {
  in_progress: "In Progress",
  completed: "Completed",
};

export function useInventoryAdjustmentTable({
  items,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseInventoryAdjustmentTableOptions) {
  const { dateFormat } = useProfile();

  const dataColumns: ColumnDef<InventoryAdjustment>[] = [
    {
      accessorKey: "document_no",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Document No." />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("document_no")}
        </button>
      ),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "type",
      header: "Type",
      enableSorting: false,
      cell: ({ row }) => {
        const type = row.getValue("type") as InventoryAdjustmentType;
        return (
          <Badge variant={typeVariantMap[type]} size="sm">
            {type === "stock-in" ? "Stock In" : "Stock Out"}
          </Badge>
        );
      },
      meta: { skeleton: columnSkeletons.badge },
    },
    {
      accessorKey: "doc_status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue(
          "doc_status",
        ) as InventoryAdjustmentStatus;
        return (
          <Badge variant={statusVariantMap[status]} size="sm">
            {statusLabelMap[status]}
          </Badge>
        );
      },
      meta: { skeleton: columnSkeletons.badge },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => formatDate(row.getValue("created_at"), dateFormat),
      meta: { skeleton: columnSkeletons.text },
    },
  ];

  const allColumns: ColumnDef<InventoryAdjustment>[] = [
    selectColumn<InventoryAdjustment>(),
    indexColumn<InventoryAdjustment>(params),
    ...dataColumns,
    actionColumn<InventoryAdjustment>(onDelete),
  ];

  return useReactTable({
    data: items,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (Number(params.perpage) || 10)),
  });
}
