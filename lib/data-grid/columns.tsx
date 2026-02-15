import type { ColumnDef } from "@tanstack/react-table";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/reui/data-grid/data-grid-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@/components/reui/badge";
import { DataGridRowActions } from "@/components/reui/data-grid/data-grid-row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { ParamsDto } from "@/types/params";

export const columnSkeletons = {
  checkbox: <Skeleton className="mx-auto h-3 w-3 rounded" />,
  number: <Skeleton className="h-2.5 w-5" />,
  text: <Skeleton className="h-2.5 w-3/4" />,
  textShort: <Skeleton className="h-2.5 w-1/2" />,
  badge: <Skeleton className="mx-auto h-4 w-12 rounded-full" />,
};

export function selectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: () => <DataGridTableRowSelectAll />,
    cell: ({ row }) => <DataGridTableRowSelect row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 30,
    meta: {
      headerClassName: "text-center",
      cellClassName: "text-center",
      skeleton: columnSkeletons.checkbox,
    },
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
    size: 30,
    meta: {
      headerClassName: "text-center",
      cellClassName: "text-center",
      skeleton: columnSkeletons.checkbox,
    },
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
      skeleton: columnSkeletons.badge,
    },
  };
}

export function actionColumn<T>(onDelete: (item: T) => void): ColumnDef<T> {
  return {
    id: "action",
    header: () => "",
    cell: ({ row }) => (
      <DataGridRowActions onDelete={() => onDelete(row.original)} />
    ),
    enableSorting: false,
    size: 40,
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right",
      skeleton: null,
    },
  };
}
