import type { ColumnDef } from "@tanstack/react-table";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/reui/data-grid/data-grid-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@/components/reui/badge";
import { DataGridRowActions } from "@/components/reui/data-grid/data-grid-row-actions";
import type { ParamsDto } from "@/types/params";

export function selectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: () => (
      <div className="flex justify-center">
        <DataGridTableRowSelectAll />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DataGridTableRowSelect row={row} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 20,
  };
}

export function indexColumn<T>(params: ParamsDto): ColumnDef<T> {
  return {
    id: "index",
    header: "#",
    cell: ({ row }) =>
      row.index +
      1 +
      ((Number(params.page) || 1) - 1) * (Number(params.perpage) || 10),
    enableSorting: false,
    enableHiding: false,
    size: 20,
  };
}

export function statusColumn<T>(): ColumnDef<T> {
  return {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title="Status"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <Badge
        size="sm"
        variant={row.getValue("is_active") ? "success" : "destructive"}
      >
        {row.getValue("is_active") ? "Active" : "Inactive"}
      </Badge>
    ),
    size: 100,
    meta: {
      cellClassName: "text-center",
      headerClassName: "text-center",
    },
  };
}

export function actionColumn<T>(
  onDelete: (item: T) => void,
): ColumnDef<T> {
  return {
    id: "action",
    header: () => "",
    cell: ({ row }) => (
      <DataGridRowActions onDelete={() => onDelete(row.original)} />
    ),
    enableSorting: false,
    size: 40,
  };
}
