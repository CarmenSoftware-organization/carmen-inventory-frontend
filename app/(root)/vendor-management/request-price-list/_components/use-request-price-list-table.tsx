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
import type { RequestPriceList } from "@/types/request-price-list";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseRequestPriceListTableOptions {
  items: RequestPriceList[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (item: RequestPriceList) => void;
  onDelete: (item: RequestPriceList) => void;
}

function formatPeriod(startDate: string, endDate: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const from = fmt(startDate);
  const to = fmt(endDate);
  if (!from && !to) return "—";
  return `${from} - ${to}`;
}

export function useRequestPriceListTable({
  items,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseRequestPriceListTableOptions) {
  const dataColumns: ColumnDef<RequestPriceList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("name")}
        </button>
      ),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "template_name",
      accessorFn: (row) => row.pricelist_template?.name ?? "",
      header: "Template",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "period",
      accessorFn: (row) => formatPeriod(row.start_date, row.end_date),
      header: "Period",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "vendor_count",
      header: "Vendors",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.textShort },
    },
  ];

  const allColumns: ColumnDef<RequestPriceList>[] = [
    selectColumn<RequestPriceList>(),
    indexColumn<RequestPriceList>(params),
    ...dataColumns,
    actionColumn<RequestPriceList>(onDelete),
  ];

  return useReactTable({
    data: items,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (Number(params.perpage) || 10)),
  });
}
