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
  useStoreRequisition,
  useDeleteStoreRequisition,
} from "@/hooks/use-store-requisition";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { StoreRequisition } from "@/types/store-requisition";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { STORE_REQUISITION_STATUS_OPTIONS } from "@/constant/store-requisition";
import { useStoreRequisitionTable } from "./use-store-requisition-table";

export default function StoreRequisitionComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<StoreRequisition | null>(
    null,
  );
  const deleteStoreRequisition = useDeleteStoreRequisition();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useStoreRequisition(params);

  const items = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useStoreRequisitionTable({
    items,
    totalRecords,
    params,
    tableConfig,
    onEdit: (item) =>
      router.push(`/store-operation/store-requisition/${item.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Store Requisition"
      description="Manage store requisitions for your business."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter
            value={filter}
            onChange={setFilter}
            options={STORE_REQUISITION_STATUS_OPTIONS}
          />
        </>
      }
      actions={
        <>
          <Button
            size="sm"
            onClick={() =>
              router.push("/store-operation/store-requisition/new")
            }
          >
            <Plus />
            Add Requisition
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
          !open && !deleteStoreRequisition.isPending && setDeleteTarget(null)
        }
        title="Delete Store Requisition"
        description={`Are you sure you want to delete "${deleteTarget?.sr_no}"? This action cannot be undone.`}
        isPending={deleteStoreRequisition.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteStoreRequisition.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Store requisition deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
