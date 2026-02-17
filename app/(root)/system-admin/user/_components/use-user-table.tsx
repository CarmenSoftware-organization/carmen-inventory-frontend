import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import {
  selectColumn,
  indexColumn,
  actionColumn,
} from "@/lib/data-grid/columns";
import type { User } from "@/types/workflows";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseUserTableOptions {
  users: User[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function useUserTable({
  users,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseUserTableOptions) {
  "use no memo";

  const columns: ColumnDef<User>[] = [
    selectColumn<User>(),
    indexColumn<User>(params),
    {
      accessorKey: "firstname",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="First Name" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("firstname")}
        </button>
      ),
    },
    {
      accessorKey: "lastname",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Last Name" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Email" />
      ),
    },
    {
      id: "department",
      accessorFn: (row) => row.department?.name,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Department" />
      ),
    },
    actionColumn<User>(onDelete),
  ];

  return useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (params.perpage as number)),
  });
}
