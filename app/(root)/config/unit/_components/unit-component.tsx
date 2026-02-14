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
import { useUnit, useDeleteUnit } from "@/hooks/use-unit";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Unit } from "@/types/unit";
import SearchInput from "@/components/search-input";
import { DataGridRowActions } from "@/components/reui/data-grid/data-grid-row-actions";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import { UnitDialog } from "@/components/share/unit-dialog";

export default function UnitComponent() {
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const deleteUnit = useDeleteUnit();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useUnit(params);

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
              ((Number(params.page) || 1) - 1) * (Number(params.perpage) || 10)}
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 20,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          return (
            <button
              type="button"
              className="font-medium hover:underline text-left"
              onClick={() => {
                setEditUnit(row.original);
                setDialogOpen(true);
              }}
            >
              {row.getValue("name")}
            </button>
          );
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
          <DataGridRowActions onDelete={() => setDeleteTarget(row.original)} />
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

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-2">
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
        <Button
          size="sm"
          onClick={() => {
            setEditUnit(null);
            setDialogOpen(true);
          }}
        >
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

      {/* Unit Dialog (Add / Edit) */}
      <UnitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unit={editUnit}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Unit"
        description={`Are you sure you want to delete unit "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteUnit.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteUnit.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
