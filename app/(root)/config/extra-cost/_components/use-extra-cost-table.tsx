import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { ExtraCost } from "@/types/extra-cost";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseExtraCostTableOptions {
  extraCosts: ExtraCost[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (extraCost: ExtraCost) => void;
  onDelete: (extraCost: ExtraCost) => void;
}

export function useExtraCostTable({
  extraCosts,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseExtraCostTableOptions) {
  const columns: ColumnDef<ExtraCost>[] = [
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

  return useConfigTable<ExtraCost>({
    data: extraCosts,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
