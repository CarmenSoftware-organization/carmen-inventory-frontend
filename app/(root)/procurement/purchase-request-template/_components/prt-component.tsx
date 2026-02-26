"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { usePrt, useDeletePrt } from "@/hooks/use-prt";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { PurchaseRequestTemplate } from "@/types/purchase-request";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { usePrtTable } from "./use-prt-table";

export default function PrtComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] =
    useState<PurchaseRequestTemplate | null>(null);
  const deletePrt = useDeletePrt();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = usePrt(params);

  const templates = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = usePrtTable({
    templates,
    totalRecords,
    params,
    tableConfig,
    onEdit: (template) =>
      router.push(`/procurement/purchase-request-template/${template.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Purchase Request Template"
      description="Manage purchase request templates."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <Button
          size="sm"
          onClick={() =>
            router.push("/procurement/purchase-request-template/new")
          }
        >
          <Plus aria-hidden="true" />
          Add Template
        </Button>
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

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deletePrt.isPending && setDeleteTarget(null)
        }
        title="Delete Template"
        description={`Are you sure you want to delete template "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deletePrt.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePrt.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Template deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
