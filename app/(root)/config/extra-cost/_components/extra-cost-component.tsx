"use client";

import { useState } from "react";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useExtraCost, useDeleteExtraCost } from "@/hooks/use-extra-cost";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { ExtraCost } from "@/types/extra-cost";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import { ExtraCostDialog } from "./extra-cost-dialog";
import DisplayTemplate from "@/components/display-template";
import { useExtraCostTable } from "./use-extra-cost-table";

export default function ExtraCostComponent() {
  const [deleteTarget, setDeleteTarget] = useState<ExtraCost | null>(null);
  const deleteExtraCost = useDeleteExtraCost();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editExtraCost, setEditExtraCost] = useState<ExtraCost | null>(null);
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useExtraCost(params);

  const extraCosts = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useExtraCostTable({
    extraCosts,
    totalRecords,
    params,
    tableConfig,
    onEdit: (extraCost) => {
      setEditExtraCost(extraCost);
      setDialogOpen(true);
    },
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Extra Cost"
      description="Manage extra cost types for your inventory."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <>
          <Button
            size="sm"
            onClick={() => {
              setEditExtraCost(null);
              setDialogOpen(true);
            }}
          >
            <Plus />
            Add Extra Cost
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
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <ExtraCostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        extraCost={editExtraCost}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteExtraCost.isPending && setDeleteTarget(null)
        }
        title="Delete Extra Cost"
        description={`Are you sure you want to delete extra cost "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteExtraCost.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteExtraCost.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Extra cost deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
