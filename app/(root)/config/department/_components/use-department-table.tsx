import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/reui/cell-action";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { Department } from "@/types/department";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

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
