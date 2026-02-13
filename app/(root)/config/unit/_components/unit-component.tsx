"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/reui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@/components/reui/badge";
import { useUnit } from "@/hooks/use-unit";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Unit } from "@/types/unit";

export default function UnitComponent() {
  const { params, tableConfig } = useDataGridState();
  const { data, isLoading, error } = useUnit(params);

  const columns: ColumnDef<Unit>[] = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <div className="flex justify-center">
            <DataGridTableRowSelectAll />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <DataGridTableRowSelect row={row} />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 20,
      },
      {
        id: "no",
        header: () => "#",
        cell: ({ row }) => <span>{row.index + 1}</span>,
        enableSorting: false,
        size: 20,
        meta: {
          cellClassName: "text-center",
          headerClassName: "text-center",
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "description",
        header: () => "Description",
        cell: ({ row }) => row.getValue("description") || "-",
        enableSorting: false,
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title="Status"
            className="justify-center"
          />
        ),
        cell: ({ row }) => (
          <Badge variant={row.getValue("is_active") ? "success" : "destructive"}>
            {row.getValue("is_active") ? "Active" : "Inactive"}
          </Badge>
        ),
        meta: {
          cellClassName: "text-center",
          headerClassName: "text-center",
        },
      },
    ],
    [],
  );

  const units = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useReactTable({
    data: units,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (params.perpage as number)),
  });

  if (error) return <p>Error: {error.message}</p>;

  return (
    <DataGrid table={table} recordCount={totalRecords} isLoading={isLoading}>
      <DataGridContainer>
        <DataGridTable />
      </DataGridContainer>
      <DataGridPagination />
    </DataGrid>
  );
}
