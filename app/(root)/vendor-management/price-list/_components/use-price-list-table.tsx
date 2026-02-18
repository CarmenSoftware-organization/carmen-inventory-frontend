"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { Badge } from "@/components/ui/badge";
import {
  selectColumn,
  indexColumn,
  actionColumn,
  columnSkeletons,
} from "@/components/ui/data-grid/columns";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import type { PriceList } from "@/types/price-list";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UsePriceListTableOptions {
  priceLists: PriceList[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (priceList: PriceList) => void;
  onDelete: (priceList: PriceList) => void;
}

export function usePriceListTable({
  priceLists,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UsePriceListTableOptions) {
  const { dateFormat } = useProfile();

  const formatPeriod = (period: string): string => {
    const parts = period.split(" - ");
    if (parts.length !== 2) return period;
    const from = formatDate(parts[0], dateFormat);
    const to = formatDate(parts[1], dateFormat);
    if (!from && !to) return "—";
    return `${from} - ${to}`;
  };

  const dataColumns: ColumnDef<PriceList>[] = [
    {
      accessorKey: "no",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="No." />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("no")}
        </CellAction>
      ),
      size: 160,
      meta: { skeleton: columnSkeletons.textShort },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "vendor_name",
      accessorFn: (row) => row.vendor?.name ?? "",
      header: "Vendor",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "effectivePeriod",
      header: "Effective Period",
      enableSorting: false,
      cell: ({ row }) => formatPeriod(row.getValue("effectivePeriod")),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Status"
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        const variantMap: Record<string, "outline" | "success" | "destructive"> =
          {
            draft: "outline",
            active: "success",
            inactive: "destructive",
          };
        const labelMap: Record<string, string> = {
          draft: "Draft",
          active: "Active",
          inactive: "Inactive",
        };
        return (
          <Badge size="sm" variant={variantMap[status] ?? "outline"}>
            {labelMap[status] ?? status}
          </Badge>
        );
      },
      size: 100,
      enableSorting: false,
      meta: {
        cellClassName: "text-center",
        headerClassName: "text-center",
        skeleton: columnSkeletons.badge,
      },
    },
  ];

  const allColumns: ColumnDef<PriceList>[] = [
    selectColumn<PriceList>(),
    indexColumn<PriceList>(params),
    ...dataColumns,
    actionColumn<PriceList>(onDelete),
  ];

  return useReactTable({
    data: priceLists,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (Number(params.perpage) || 10)),
  });
}
