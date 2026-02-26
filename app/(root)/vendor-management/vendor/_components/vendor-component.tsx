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
import { useVendor, useDeleteVendor } from "@/hooks/use-vendor";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Vendor } from "@/types/vendor";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useVendorTable } from "./use-vendor-table";

export default function VendorComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const deleteVendor = useDeleteVendor();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useVendor(params);

  const vendors = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useVendorTable({
    vendors,
    totalRecords,
    params,
    tableConfig,
    onEdit: (vendor) =>
      router.push(`/vendor-management/vendor/${vendor.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Vendor"
      description="Manage vendors for your business."
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
            onClick={() => router.push("/vendor-management/vendor/new")}
          >
            <Plus />
            Add Vendor
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
          !open && !deleteVendor.isPending && setDeleteTarget(null)
        }
        title="Delete Vendor"
        description={`Are you sure you want to delete vendor "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteVendor.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteVendor.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Vendor deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
