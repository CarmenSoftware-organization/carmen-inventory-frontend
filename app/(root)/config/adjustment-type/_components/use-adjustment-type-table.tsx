import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/reui/cell-action";
import { Badge } from "@/components/reui/badge";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
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
  const columns: ColumnDef<AdjustmentType>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("code")}
        </CellAction>
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
              type === ADJUSTMENT_TYPE.STOCK_IN ? "default" : "warning"
            }
          >
            {type === ADJUSTMENT_TYPE.STOCK_IN ? "Stock In" : "Stock Out"}
          </Badge>
        );
      },
      size: 120,
    },
  ];

  return useConfigTable<AdjustmentType>({
    data: adjustmentTypes,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
