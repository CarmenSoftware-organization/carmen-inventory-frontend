"use no memo";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import EmptyComponent from "@/components/empty-component";

interface UserTableRow {
  id: string;
  firstname: string;
  lastname: string;
  telephone: string;
}

interface UserTableProps {
  readonly users: UserTableRow[];
  readonly className?: string;
}

const columns: ColumnDef<UserTableRow>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
    size: 50,
    meta: { headerClassName: "text-center", cellClassName: "text-center" },
  },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) =>
      `${row.original.firstname} ${row.original.lastname}`,
  },
  {
    accessorKey: "telephone",
    header: "Telephone",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.telephone}
      </span>
    ),
  },
];

export function UserTable({ users, className }: UserTableProps) {
  const data = useMemo(() => users, [users]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className={cn(className)}>
      <DataGrid
        table={table}
        recordCount={users.length}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
        emptyMessage={
          <EmptyComponent
            icon={Users}
            title="No Users"
            description="No users assigned"
          />
        }
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
      </DataGrid>
    </div>
  );
}
