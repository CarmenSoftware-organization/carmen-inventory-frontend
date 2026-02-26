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
import {
  useWastageReport,
  useDeleteWastageReport,
} from "@/hooks/use-wastage-report";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { WastageReport } from "@/types/wastage-reporting";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { WASTAGE_REPORT_STATUS_OPTIONS } from "@/constant/wastage-reporting";
import { useWastageReportTable } from "./use-wr-table";

export default function WrComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<WastageReport | null>(null);
  const deleteWr = useDeleteWastageReport();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useWastageReport(params);

  const items = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useWastageReportTable({
    items,
    totalRecords,
    params,
    tableConfig,
    onEdit: (item) =>
      router.push(`/store-operation/wastage-reporting/${item.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Wastage Reporting"
      description="Record and track wastage of inventory items."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter
            value={filter}
            onChange={setFilter}
            options={WASTAGE_REPORT_STATUS_OPTIONS}
          />
        </>
      }
      actions={
        <Button
          size="sm"
          onClick={() =>
            router.push("/store-operation/wastage-reporting/new")
          }
        >
          <Plus aria-hidden="true" />
          Add Report
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
          !open && !deleteWr.isPending && setDeleteTarget(null)
        }
        title="Delete Wastage Report"
        description={`Are you sure you want to delete "${deleteTarget?.wr_no}"? This action cannot be undone.`}
        isPending={deleteWr.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteWr.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Wastage report deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
