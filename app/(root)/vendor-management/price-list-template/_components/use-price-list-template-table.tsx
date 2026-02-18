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
import type { PriceListTemplate } from "@/types/price-list-template";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UsePriceListTemplateTableOptions {
  templates: PriceListTemplate[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (template: PriceListTemplate) => void;
  onDelete: (template: PriceListTemplate) => void;
}

export function usePriceListTemplateTable({
  templates,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UsePriceListTemplateTableOptions) {
  const dataColumns: ColumnDef<PriceListTemplate>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("name")}
        </CellAction>
      ),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "currency_code",
      accessorFn: (row) => row.currency?.code ?? "",
      header: "Currency",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.textShort },
    },
    {
      accessorKey: "validity_period",
      header: "Validity Period",
      cell: ({ row }) => {
        const val = row.getValue<number | null>("validity_period");
        return val != null ? `${val} days` : "—";
      },
      enableSorting: false,
      meta: { skeleton: columnSkeletons.textShort },
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

  const allColumns: ColumnDef<PriceListTemplate>[] = [
    selectColumn<PriceListTemplate>(),
    indexColumn<PriceListTemplate>(params),
    ...dataColumns,
    actionColumn<PriceListTemplate>(onDelete),
  ];

  return useReactTable({
    data: templates,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (Number(params.perpage) || 10)),
  });
}
