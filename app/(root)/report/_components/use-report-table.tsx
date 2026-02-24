// TODO: ลบ mock imports เมื่อ API พร้อม — เปลี่ยนไปใช้ useConfigTable แทน

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import type { Report } from "@/types/report";

interface UseReportTableOptions {
  reports: Report[];
}

export function useReportTable({ reports }: UseReportTableOptions) {
  const columns: ColumnDef<Report>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        size: 50,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <span className="capitalize">{row.getValue("type")}</span>
        ),
      },
    ],
    [],
  );

  return useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
}
