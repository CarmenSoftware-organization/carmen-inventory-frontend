import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/reui/cell-action";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { PhysicalCount } from "@/types/physical-count";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UsePhysicalCountTableOptions {
  physicalCounts: PhysicalCount[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (physicalCount: PhysicalCount) => void;
  onDelete: (physicalCount: PhysicalCount) => void;
}

export function usePhysicalCountTable({
  physicalCounts,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UsePhysicalCountTableOptions) {
  const columns: ColumnDef<PhysicalCount>[] = [
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

  return useConfigTable<PhysicalCount>({
    data: physicalCounts,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
