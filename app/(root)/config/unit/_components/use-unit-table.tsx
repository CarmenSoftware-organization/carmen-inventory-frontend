import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { Unit } from "@/types/unit";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseUnitTableOptions {
  units: Unit[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
}

export function useUnitTable({
  units,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseUnitTableOptions) {
  const columns: ColumnDef<Unit>[] = [
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
    },
  ];

  return useConfigTable<Unit>({
    data: units,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
