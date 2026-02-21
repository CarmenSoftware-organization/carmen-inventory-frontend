import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { Department } from "@/types/department";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { Badge } from "@/components/ui/badge";

interface UseDepartmentTableOptions {
  departments: Department[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export function useDepartmentTable({
  departments,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseDepartmentTableOptions) {
  const columns: ColumnDef<Department>[] = [
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

  return useConfigTable<Department>({
    data: departments,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
