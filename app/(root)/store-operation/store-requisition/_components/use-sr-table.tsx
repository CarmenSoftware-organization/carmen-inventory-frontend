"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import {
  selectColumn,
  indexColumn,
  actionColumn,
  columnSkeletons,
} from "@/components/ui/data-grid/columns";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import type {
  StoreRequisition,
  StoreRequisitionStatus,
} from "@/types/store-requisition";
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

const statusVariantMap: Record<
  StoreRequisitionStatus,
  "outline" | "secondary" | "success" | "destructive" | "info"
> = {
  draft: "secondary",
  submitted: "info",
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
  const { dateFormat } = useProfile();

  const dataColumns: ColumnDef<StoreRequisition>[] = [
    {
      accessorKey: "sr_no",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="SR No." />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("sr_no")}
        </CellAction>
      ),
      meta: { skeleton: columnSkeletons.text },
      size: 150,
    },
    {
      accessorKey: "sr_date",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="SR Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("sr_date"), dateFormat),
      meta: { skeleton: columnSkeletons.text },
      size: 120,
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
      size: 220,
    },
    {
      accessorKey: "doc_status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue("doc_status") as StoreRequisitionStatus;
        return (
          <Badge variant={statusVariantMap[status]} size="sm">
            {status.toUpperCase()}
          </Badge>
        );
      },
      meta: { skeleton: columnSkeletons.badge },
      size: 120,
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
