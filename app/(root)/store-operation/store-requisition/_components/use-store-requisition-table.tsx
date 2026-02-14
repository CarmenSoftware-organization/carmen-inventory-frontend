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
import type { StoreRequisition, StoreRequisitionStatus } from "@/types/store-requisition";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseStoreRequisitionTableOptions {
  items: StoreRequisition[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (item: StoreRequisition) => void;
  onDelete: (item: StoreRequisition) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const statusVariantMap: Record<
  StoreRequisitionStatus,
  "outline" | "secondary" | "success" | "destructive"
> = {
  draft: "outline",
  submitted: "secondary",
  approved: "success",
  rejected: "destructive",
};

export function useStoreRequisitionTable({
  items,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseStoreRequisitionTableOptions) {
  const dataColumns: ColumnDef<StoreRequisition>[] = [
    {
      accessorKey: "sr_no",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="SR No." />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("sr_no")}
        </button>
      ),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "sr_date",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="SR Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("sr_date")),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "requestor_name",
      header: "Requestor",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "department_name",
      header: "Department",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "location",
      accessorFn: (row) =>
        `${row.from_location_name} → ${row.to_location_name}`,
      header: "From → To",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "doc_status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue("doc_status") as StoreRequisitionStatus;
        return (
          <Badge variant={statusVariantMap[status]} size="sm">
            {status}
          </Badge>
        );
      },
      meta: { skeleton: columnSkeletons.badge },
    },
  ];

  const allColumns: ColumnDef<StoreRequisition>[] = [
    selectColumn<StoreRequisition>(),
    indexColumn<StoreRequisition>(params),
    ...dataColumns,
    actionColumn<StoreRequisition>(onDelete),
  ];

  return useReactTable({
    data: items,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (Number(params.perpage) || 10)),
  });
}
