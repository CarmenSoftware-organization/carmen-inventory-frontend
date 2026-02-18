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
  useRequestPriceList,
  useDeleteRequestPriceList,
} from "@/hooks/use-request-price-list";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { RequestPriceList } from "@/types/request-price-list";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import DisplayTemplate from "@/components/display-template";
import { useRequestPriceListTable } from "./use-rpl-table";

export default function RequestPriceListComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<RequestPriceList | null>(
    null,
  );
  const deleteRequestPriceList = useDeleteRequestPriceList();
  const { params, search, setSearch, tableConfig } = useDataGridState();
  const { data, isLoading, error, refetch } = useRequestPriceList(params);

  const items = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useRequestPriceListTable({
    items,
    totalRecords,
    params,
    tableConfig,
    onEdit: (item) =>
      router.push(`/vendor-management/request-price-list/${item.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Request Price List"
      description="Manage request price lists for your business."
      toolbar={<SearchInput defaultValue={search} onSearch={setSearch} />}
      actions={
        <>
          <Button
            size="sm"
            onClick={() =>
              router.push("/vendor-management/request-price-list/new")
            }
          >
            <Plus />
            Add Request
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
          !open && !deleteRequestPriceList.isPending && setDeleteTarget(null)
        }
        title="Delete Request Price List"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteRequestPriceList.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteRequestPriceList.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Request price list deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
