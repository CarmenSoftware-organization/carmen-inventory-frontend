import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { Location } from "@/types/location";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { Badge } from "@/components/ui/badge";

interface UseLocationTableOptions {
  locations: Location[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export function useLocationTable({
  locations,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseLocationTableOptions) {
  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          <Badge variant={"secondary"} size={"xs"}>
            {row.original.code}
          </Badge>
          - {row.original.name}
        </CellAction>
      ),
    },
  ];

  return useConfigTable<Location>({
    data: locations,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
