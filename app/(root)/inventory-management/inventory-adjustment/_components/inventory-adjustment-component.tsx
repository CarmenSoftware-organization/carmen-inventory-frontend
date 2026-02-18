"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import {
  useInventoryAdjustment,
  useDeleteInventoryAdjustment,
} from "@/hooks/use-inventory-adjustment";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { InventoryAdjustment } from "@/types/inventory-adjustment";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { INVENTORY_ADJUSTMENT_STATUS_OPTIONS } from "@/constant/inventory-adjustment";
import { useInventoryAdjustmentTable } from "./use-inventory-adjustment-table";

export default function InventoryAdjustmentComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] =
    useState<InventoryAdjustment | null>(null);
  const deleteInventoryAdjustment = useDeleteInventoryAdjustment();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useInventoryAdjustment(params);

  const items = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useInventoryAdjustmentTable({
    items,
    totalRecords,
    params,
    tableConfig,
    onEdit: (item) =>
      router.push(
        `/inventory-management/inventory-adjustment/${item.id}`,
      ),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Inventory Adjustment"
      description="Manage stock in and stock out adjustments."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter
            value={filter}
            onChange={setFilter}
            options={INVENTORY_ADJUSTMENT_STATUS_OPTIONS}
          />
        </>
      }
      actions={
        <>
          <Button
            size="sm"
            onClick={() =>
              router.push(
                "/inventory-management/inventory-adjustment/new?type=stock-in",
              )
            }
          >
            <Plus />
            Add Stock In
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              router.push(
                "/inventory-management/inventory-adjustment/new?type=stock-out",
              )
            }
          >
            <Plus />
            Add Stock Out
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

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open &&
          !deleteInventoryAdjustment.isPending &&
          setDeleteTarget(null)
        }
        title="Delete Inventory Adjustment"
        description={`Are you sure you want to delete "${deleteTarget?.document_no}"? This action cannot be undone.`}
        isPending={deleteInventoryAdjustment.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteInventoryAdjustment.mutate(
            { id: deleteTarget.id, type: deleteTarget.type },
            {
              onSuccess: () => {
                toast.success("Inventory adjustment deleted successfully");
                setDeleteTarget(null);
              },
              onError: (err) => toast.error(err.message),
            },
          );
        }}
      />
    </DisplayTemplate>
  );
}
