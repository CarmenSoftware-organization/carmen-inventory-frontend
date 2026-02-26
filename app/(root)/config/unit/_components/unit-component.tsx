"use client";

import { useState } from "react";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useUnit, useDeleteUnit } from "@/hooks/use-unit";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Unit } from "@/types/unit";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import { UnitDialog } from "@/components/share/unit-dialog";
import DisplayTemplate from "@/components/display-template";
import { useUnitTable } from "@/app/(root)/config/unit/_components/use-unit-table";

export default function UnitComponent() {
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);
  const deleteUnit = useDeleteUnit();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useUnit(params);

  const units = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useUnitTable({
    units,
    totalRecords,
    params,
    tableConfig,
    onEdit: (unit) => {
      setEditUnit(unit);
      setDialogOpen(true);
    },
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Unit"
      description="Manage unit of measurement for your inventory."
      toolbar={
        <>
          <SearchInput
            defaultValue={search}
            onSearch={setSearch}
            data-id="unit-list-search-input"
          />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <>
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
          <Button size="sm" variant="outline">
            <Download />
            Export
          </Button>
          <Button size="sm" variant="outline">
            <Printer />
            Print
          </Button>
        </>
      }
    >
      <DataGrid
        table={table}
        recordCount={totalRecords}
        isLoading={isLoading}
        tableLayout={{ dense: true, headerSeparator: true }}
        tableClassNames={{ base: "text-sm" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <UnitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unit={editUnit}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteUnit.isPending && setDeleteTarget(null)
        }
        title="Delete Unit"
        description={`Are you sure you want to delete unit "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteUnit.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteUnit.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Unit deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
