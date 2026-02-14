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
import { useLocation, useDeleteLocation } from "@/hooks/use-location";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Location } from "@/types/location";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useLocationTable } from "./use-location-table";

export default function LocationComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const deleteLocation = useDeleteLocation();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useLocation(params);

  const locations = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useLocationTable({
    locations,
    totalRecords,
    params,
    tableConfig,
    onEdit: (location) => router.push(`/config/location/${location.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Store Location"
      description="Manage store locations for your inventory."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <>
          <Button
            size="xs"
            onClick={() => router.push("/config/location/new")}
          >
            <Plus />
            Add Store Location
          </Button>
          <Button size="xs" variant="outline">
            <Download />
            Export
          </Button>
          <Button size="xs" variant="outline">
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
          !open && !deleteLocation.isPending && setDeleteTarget(null)
        }
        title="Delete Store Location"
        description={`Are you sure you want to delete location "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteLocation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteLocation.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Location deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
