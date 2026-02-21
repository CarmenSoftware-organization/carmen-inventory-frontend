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
  useSpotCheck,
  useDeleteSpotCheck,
} from "@/hooks/use-spot-check";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { SpotCheck } from "@/types/spot-check";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useSpotCheckTable } from "./use-sc-table";

export default function ScComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<SpotCheck | null>(null);
  const deleteSc = useDeleteSpotCheck();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useSpotCheck(params);

  const spotChecks = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useSpotCheckTable({
    spotChecks,
    totalRecords,
    params,
    tableConfig,
    onEdit: (sc) =>
      router.push(`/inventory-management/spot-check/${sc.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Spot Check"
      description="Manage spot checks for inventory."
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
            onClick={() =>
              router.push("/inventory-management/spot-check/new")
            }
          >
            <Plus />
            Add Spot Check
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

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteSc.isPending && setDeleteTarget(null)
        }
        title="Delete Spot Check"
        description={`Are you sure you want to delete this spot check? This action cannot be undone.`}
        isPending={deleteSc.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteSc.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Spot check deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
