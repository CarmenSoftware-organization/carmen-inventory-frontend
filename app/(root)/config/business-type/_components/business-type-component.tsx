"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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
  useBusinessType,
  useDeleteBusinessType,
} from "@/hooks/use-business-type";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { BusinessType } from "@/types/business-type";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
const BusinessTypeDialog = dynamic(() =>
  import("./business-type-dialog").then((mod) => mod.BusinessTypeDialog),
);
import DisplayTemplate from "@/components/display-template";
import { useBusinessTypeTable } from "./use-business-type-table";

export default function BusinessTypeComponent() {
  const [deleteTarget, setDeleteTarget] = useState<BusinessType | null>(null);
  const deleteBusinessType = useDeleteBusinessType();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBusinessType, setEditBusinessType] =
    useState<BusinessType | null>(null);
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useBusinessType(params);

  const businessTypes = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useBusinessTypeTable({
    businessTypes,
    totalRecords,
    params,
    tableConfig,
    onEdit: (businessType) => {
      setEditBusinessType(businessType);
      setDialogOpen(true);
    },
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Business Type"
      description="Manage vendor business types for your inventory."
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
            onClick={() => {
              setEditBusinessType(null);
              setDialogOpen(true);
            }}
          >
            <Plus />
            Add Business Type
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
        tableClassNames={{ base: "text-sm" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <BusinessTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        businessType={editBusinessType}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteBusinessType.isPending && setDeleteTarget(null)
        }
        title="Delete Business Type"
        description={`Are you sure you want to delete business type "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteBusinessType.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteBusinessType.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Business type deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
