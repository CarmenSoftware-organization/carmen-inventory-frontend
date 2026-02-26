"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Printer, Wrench } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useEquipment, useDeleteEquipment } from "@/hooks/use-equipment";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Equipment } from "@/types/equipment";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import EmptyComponent from "@/components/empty-component";
import { useEquipmentTable } from "./use-equipment-table";

export default function EquipmentComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
  const deleteEquipment = useDeleteEquipment();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useEquipment(params);

  const equipments = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useEquipmentTable({
    equipments,
    totalRecords,
    params,
    tableConfig,
    onEdit: (equipment) =>
      router.push(`/operation-plan/equipment/${equipment.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Equipment"
      description="Manage equipment for your operations."
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
            onClick={() => router.push("/operation-plan/equipment/new")}
          >
            <Plus aria-hidden="true" />
            Add Equipment
          </Button>
          <Button size="sm" variant="outline" disabled title="Coming soon">
            <Download aria-hidden="true" />
            Export
          </Button>
          <Button size="sm" variant="outline" disabled title="Coming soon">
            <Printer aria-hidden="true" />
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
            icon={Wrench}
            title="No Equipment"
            description="No equipment found."
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
          !open && !deleteEquipment.isPending && setDeleteTarget(null)
        }
        title="Delete Equipment"
        description={`Are you sure you want to delete equipment "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteEquipment.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteEquipment.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Equipment deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
