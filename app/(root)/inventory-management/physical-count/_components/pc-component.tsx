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
  usePhysicalCount,
  useDeletePhysicalCount,
} from "@/hooks/use-physical-count";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { PhysicalCount } from "@/types/physical-count";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { usePhysicalCountTable } from "./use-pc-table";

export default function PcComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<PhysicalCount | null>(null);
  const deletePc = useDeletePhysicalCount();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = usePhysicalCount(params);

  const physicalCounts = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = usePhysicalCountTable({
    physicalCounts,
    totalRecords,
    params,
    tableConfig,
    onEdit: (pc) =>
      router.push(`/inventory-management/physical-count/${pc.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Physical Count"
      description="Manage physical counts for inventory."
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
              router.push("/inventory-management/physical-count/new")
            }
          >
            <Plus />
            Add Physical Count
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
          !open && !deletePc.isPending && setDeleteTarget(null)
        }
        title="Delete Physical Count"
        description={`Are you sure you want to delete this physical count? This action cannot be undone.`}
        isPending={deletePc.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePc.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Physical count deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
