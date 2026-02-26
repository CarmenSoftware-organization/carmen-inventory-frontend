"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Printer, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useCuisine, useDeleteCuisine } from "@/hooks/use-cuisine";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Cuisine } from "@/types/cuisine";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import EmptyComponent from "@/components/empty-component";
import { useCuisineTable } from "./use-cuisine-table";

export default function CuisineComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Cuisine | null>(null);
  const deleteCuisine = useDeleteCuisine();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useCuisine(params);

  const cuisines = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useCuisineTable({
    cuisines,
    totalRecords,
    params,
    tableConfig,
    onEdit: (cuisine) =>
      router.push(`/operation-plan/cuisine/${cuisine.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Cuisine"
      description="Manage cuisines for your recipes."
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
            onClick={() => router.push("/operation-plan/cuisine/new")}
          >
            <Plus />
            Add Cuisine
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
        emptyMessage={
          <EmptyComponent
            icon={UtensilsCrossed}
            title="No Cuisines"
            description="No cuisines found."
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
          !open && !deleteCuisine.isPending && setDeleteTarget(null)
        }
        title="Delete Cuisine"
        description={`Are you sure you want to delete cuisine "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteCuisine.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCuisine.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Cuisine deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
