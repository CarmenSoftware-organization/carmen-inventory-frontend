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
import { formatCurrency } from "@/lib/currency-utils";
import type {
  WastageReport,
  WastageReportStatus,
} from "@/types/wastage-reporting";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseWastageReportTableOptions {
  items: WastageReport[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (item: WastageReport) => void;
  onDelete: (item: WastageReport) => void;
}

const statusVariantMap: Record<
  WastageReportStatus,
  "outline" | "secondary" | "success" | "destructive"
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
};

export function useWastageReportTable({
  items,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseWastageReportTableOptions) {
  const { dateFormat } = useProfile();

  const dataColumns: ColumnDef<WastageReport>[] = [
    {
      accessorKey: "wr_no",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="WR No." />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("wr_no")}
        </CellAction>
      ),
      meta: { skeleton: columnSkeletons.text },
      size: 150,
    },
    {
      accessorKey: "location_name",
      header: "Location",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("date"), dateFormat),
      meta: { skeleton: columnSkeletons.text },
      size: 120,
    },
    {
      accessorKey: "qty_sum",
      header: "Total Qty",
      cell: ({ row }) => row.getValue("qty_sum"),
      enableSorting: false,
      size: 80,
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right tabular-nums",
        skeleton: columnSkeletons.text,
      },
    },
    {
      accessorKey: "loss_value",
      header: "Loss Value",
      cell: ({ row }) =>
        formatCurrency(row.getValue<number>("loss_value")),
      enableSorting: false,
      size: 120,
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right tabular-nums",
        skeleton: columnSkeletons.text,
      },
    },
    {
      accessorKey: "reportor_name",
      header: "Reportor",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue("status") as WastageReportStatus;
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

  const allColumns: ColumnDef<WastageReport>[] = [
    selectColumn<WastageReport>(),
    indexColumn<WastageReport>(params),
    ...dataColumns,
    actionColumn<WastageReport>(onDelete),
  ];

  return useReactTable({
    data: items,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (Number(params.perpage) || 10)),
  });
}
