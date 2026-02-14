"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useUnit } from "@/hooks/use-unit";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Unit } from "@/types/unit";
import SearchInput from "@/components/search-input";
import { DataGridRowActions } from "@/components/reui/data-grid/data-grid-row-actions";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { StatusFilter } from "@/components/ui/status-filter";

export default function UnitComponent() {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
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
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.index +
              1 +
              ((Number(params.page) || 1) - 1) *
                (Number(params.perpage) || 10)}
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          return <p className="font-medium">{row.getValue("name")}</p>;
        },
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
          <Badge
            variant={row.getValue("is_active") ? "success" : "destructive"}
          >
            {row.getValue("is_active") ? "Active" : "Inactive"}
          </Badge>
        ),
        size: 100,
        meta: {
          cellClassName: "text-center",
          headerClassName: "text-center",
        },
      },
      {
        id: "action",
        header: () => "",
        cell: ({ row }) => (
          <DataGridRowActions
            onEdit={() => {
              // TODO: implement edit
            }}
            onDelete={() => setDeleteTarget(row.original.name)}
          />
        ),
        enableSorting: false,
        size: 40,
      },
    ],
    [params.page, params.perpage],
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
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-semibold">Unit</h1>
        <p className="text-muted-foreground text-sm">
          Manage unit of measurement for your inventory.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SearchInput
            defaultValue={search}
            onSearch={setSearch}
            data-id="unit-list-search-input"
          />
          <StatusFilter value={filter} onChange={setFilter} />
        </div>
        <Button size="sm">
          <Plus />
          Add Unit
        </Button>
      </div>

      {/* Table */}
      <DataGrid table={table} recordCount={totalRecords} isLoading={isLoading}>
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      {/* Delete Confirmation */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Unit"
        description={`Are you sure you want to delete unit "${deleteTarget}"? This action cannot be undone.`}
        onConfirm={() => {
          // TODO: implement delete API call
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
