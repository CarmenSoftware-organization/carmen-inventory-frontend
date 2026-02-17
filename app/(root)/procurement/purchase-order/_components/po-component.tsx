"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  usePurchaseOrder,
  useDeletePurchaseOrder,
} from "@/hooks/use-purchase-order";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { PurchaseOrder } from "@/types/purchase-order";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { usePoTable } from "./use-po-table";
import { CreatePODialog } from "./po-create-dialog";

export default function PoComponent() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const deletePo = useDeletePurchaseOrder();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = usePurchaseOrder(params);

  const purchaseOrders = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = usePoTable({
    purchaseOrders,
    totalRecords,
    params,
    tableConfig,
    onEdit: (po) => router.push(`/procurement/purchase-order/${po.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Purchase Order"
      description="Manage purchase orders."
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
            onClick={() => setCreateOpen(true)}
          >
            <Plus />
            Add Purchase Order
          </Button>
          <Button size="sm" variant="outline" disabled>
            <Download />
            Export
          </Button>
          <Button size="sm" variant="outline" disabled>
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

      <CreatePODialog open={createOpen} onOpenChange={setCreateOpen} />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deletePo.isPending && setDeleteTarget(null)
        }
        title="Delete Purchase Order"
        description={`Are you sure you want to delete purchase order "${deleteTarget?.po_no}"? This action cannot be undone.`}
        isPending={deletePo.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePo.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Purchase order deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
