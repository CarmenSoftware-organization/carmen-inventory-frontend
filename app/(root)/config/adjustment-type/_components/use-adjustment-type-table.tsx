import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/reui/data-grid/data-grid-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@/components/reui/badge";
import { DataGridRowActions } from "@/components/reui/data-grid/data-grid-row-actions";
import type { AdjustmentType } from "@/types/adjustment-type";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { ADJUSTMENT_TYPE } from "@/constant/adjustment-type";

interface UseAdjustmentTypeTableOptions {
  adjustmentTypes: AdjustmentType[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (adjustmentType: AdjustmentType) => void;
  onDelete: (adjustmentType: AdjustmentType) => void;
}

export function useAdjustmentTypeTable({
  adjustmentTypes,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseAdjustmentTypeTableOptions) {
  "use no memo";

  const columns: ColumnDef<AdjustmentType>[] = [
    {
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
    },
    {
      id: "index",
      header: "#",
      cell: ({ row }) =>
        row.index +
        1 +
        ((Number(params.page) || 1) - 1) * (Number(params.perpage) || 10),
      enableSorting: false,
      enableHiding: false,
      size: 20,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("code")}
        </button>
      ),
      size: 120,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue<string>("type");
        return (
          <Badge
            size="sm"
            variant={
              type === ADJUSTMENT_TYPE.STOCK_IN ? "primary" : "warning"
            }
          >
            {type === ADJUSTMENT_TYPE.STOCK_IN ? "Stock In" : "Stock Out"}
          </Badge>
        );
      },
      size: 120,
    },
    {
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
    },
    {
      id: "action",
      header: () => "",
      cell: ({ row }) => (
        <DataGridRowActions onDelete={() => onDelete(row.original)} />
      ),
      enableSorting: false,
      size: 40,
    },
  ];

  return useReactTable({
    data: adjustmentTypes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (params.perpage as number)),
  });
}
