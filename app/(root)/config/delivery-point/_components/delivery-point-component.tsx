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
import {
  useDeliveryPoint,
  useDeleteDeliveryPoint,
} from "@/hooks/use-delivery-point";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { DeliveryPoint } from "@/types/delivery-point";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import { DeliveryPointDialog } from "@/components/share/delivery-point-dialog";
import DisplayTemplate from "@/components/display-template";
import { useDeliveryPointTable } from "./use-delivery-point-table";

export default function DeliveryPointComponent() {
  const [deleteTarget, setDeleteTarget] = useState<DeliveryPoint | null>(null);
  const deleteDeliveryPoint = useDeleteDeliveryPoint();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDeliveryPoint, setEditDeliveryPoint] =
    useState<DeliveryPoint | null>(null);
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useDeliveryPoint(params);

  const deliveryPoints = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useDeliveryPointTable({
    deliveryPoints,
    totalRecords,
    params,
    tableConfig,
    onEdit: (deliveryPoint) => {
      setEditDeliveryPoint(deliveryPoint);
      setDialogOpen(true);
    },
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Delivery Point"
      description="Manage delivery points for your inventory."
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
              setEditDeliveryPoint(null);
              setDialogOpen(true);
            }}
          >
            <Plus />
            Add Delivery Point
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

      <DeliveryPointDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deliveryPoint={editDeliveryPoint}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteDeliveryPoint.isPending && setDeleteTarget(null)
        }
        title="Delete Delivery Point"
        description={`Are you sure you want to delete delivery point "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteDeliveryPoint.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteDeliveryPoint.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Delivery point deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
