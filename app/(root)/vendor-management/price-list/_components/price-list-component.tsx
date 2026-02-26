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
import { usePriceList, useDeletePriceList } from "@/hooks/use-price-list";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { PriceList } from "@/types/price-list";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { usePriceListTable } from "./use-price-list-table";

const statusOptions = [
  { label: "Draft", value: "status|string:draft" },
  { label: "Active", value: "status|string:active" },
  { label: "Inactive", value: "status|string:inactive" },
];

export default function PriceListComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<PriceList | null>(null);
  const deletePriceList = useDeletePriceList();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = usePriceList(params);

  const priceLists = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = usePriceListTable({
    priceLists,
    totalRecords,
    params,
    tableConfig,
    onEdit: (priceList) =>
      router.push(`/vendor-management/price-list/${priceList.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Price List"
      description="Manage price lists for your business."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter
            value={filter}
            onChange={setFilter}
            options={statusOptions}
          />
        </>
      }
      actions={
        <>
          <Button
            size="sm"
            onClick={() => router.push("/vendor-management/price-list/new")}
          >
            <Plus aria-hidden="true" />
            Add Price List
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
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deletePriceList.isPending && setDeleteTarget(null)
        }
        title="Delete Price List"
        description={`Are you sure you want to delete price list "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deletePriceList.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePriceList.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Price list deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
