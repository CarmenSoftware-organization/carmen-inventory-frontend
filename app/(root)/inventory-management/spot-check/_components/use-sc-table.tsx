import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/reui/cell-action";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { SpotCheck } from "@/types/spot-check";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseSpotCheckTableOptions {
  spotChecks: SpotCheck[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (spotCheck: SpotCheck) => void;
  onDelete: (spotCheck: SpotCheck) => void;
}

export function useSpotCheckTable({
  spotChecks,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseSpotCheckTableOptions) {
  const columns: ColumnDef<SpotCheck>[] = [
    {
      accessorKey: "department_name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Department" />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("department_name")}
        </CellAction>
      ),
    },
  ];

  return useConfigTable<SpotCheck>({
    data: spotChecks,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
