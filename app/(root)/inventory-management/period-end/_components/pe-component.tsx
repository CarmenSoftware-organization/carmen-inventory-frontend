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
  usePeriodEnd,
  useDeletePeriodEnd,
} from "@/hooks/use-period-end";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { PeriodEnd } from "@/types/period-end";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { usePeriodEndTable } from "./use-pe-table";

export default function PeComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<PeriodEnd | null>(null);
  const deletePe = useDeletePeriodEnd();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = usePeriodEnd(params);

  const periodEnds = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = usePeriodEndTable({
    periodEnds,
    totalRecords,
    params,
    tableConfig,
    onEdit: (pe) =>
      router.push(`/inventory-management/period-end/${pe.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Period End"
      description="Manage period end for inventory."
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
              router.push("/inventory-management/period-end/new")
            }
          >
            <Plus />
            Add Period End
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
          !open && !deletePe.isPending && setDeleteTarget(null)
        }
        title="Delete Period End"
        description={`Are you sure you want to delete period end "${deleteTarget?.pe_no}"? This action cannot be undone.`}
        isPending={deletePe.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePe.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Period end deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
