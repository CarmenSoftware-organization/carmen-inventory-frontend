"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Printer, Settings } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import {
  useAdjustmentType,
  useDeleteAdjustmentType,
} from "@/hooks/use-adjustment-type";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { AdjustmentType } from "@/types/adjustment-type";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import EmptyComponent from "@/components/empty-component";
import { useAdjustmentTypeTable } from "./use-adjustment-type-table";

export default function AdjustmentTypeComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<AdjustmentType | null>(null);
  const deleteAdjustmentType = useDeleteAdjustmentType();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useAdjustmentType(params);

  const adjustmentTypes = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useAdjustmentTypeTable({
    adjustmentTypes,
    totalRecords,
    params,
    tableConfig,
    onEdit: (adjustmentType) =>
      router.push(`/config/adjustment-type/${adjustmentType.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Adjustment Type"
      description="Manage adjustment types for your inventory."
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
            onClick={() => router.push("/config/adjustment-type/new")}
          >
            <Plus />
            Add Adjustment Type
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
        emptyMessage={
          <EmptyComponent
            icon={Settings}
            title="No Adjustment Types"
            description="No adjustment types found."
          />
        }
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteAdjustmentType.isPending && setDeleteTarget(null)
        }
        title="Delete Adjustment Type"
        description={`Are you sure you want to delete adjustment type "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteAdjustmentType.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteAdjustmentType.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Adjustment type deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
