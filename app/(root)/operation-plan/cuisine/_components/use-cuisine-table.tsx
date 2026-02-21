import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { Cuisine } from "@/types/cuisine";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseCuisineTableOptions {
  cuisines: Cuisine[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (cuisine: Cuisine) => void;
  onDelete: (cuisine: Cuisine) => void;
}

export function useCuisineTable({
  cuisines,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseCuisineTableOptions) {
  const columns: ColumnDef<Cuisine>[] = [
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
    },
    {
      accessorKey: "region",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Region" />
      ),
      size: 150,
    },
  ];

  return useConfigTable<Cuisine>({
    data: cuisines,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
