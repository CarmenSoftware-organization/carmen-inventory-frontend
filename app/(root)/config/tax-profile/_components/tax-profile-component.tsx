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
import { useTaxProfile, useDeleteTaxProfile } from "@/hooks/use-tax-profile";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { TaxProfile } from "@/types/tax-profile";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
const TaxProfileDialog = dynamic(() =>
  import("./tax-profile-dialog").then((mod) => mod.TaxProfileDialog),
);
import DisplayTemplate from "@/components/display-template";
import { useTaxProfileTable } from "./use-tax-profile-table";

export default function TaxProfileComponent() {
  const [deleteTarget, setDeleteTarget] = useState<TaxProfile | null>(null);
  const deleteTaxProfile = useDeleteTaxProfile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTaxProfile, setEditTaxProfile] = useState<TaxProfile | null>(
    null,
  );
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useTaxProfile(params);

  const taxProfiles = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useTaxProfileTable({
    taxProfiles,
    totalRecords,
    params,
    tableConfig,
    onEdit: (taxProfile) => {
      setEditTaxProfile(taxProfile);
      setDialogOpen(true);
    },
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Tax Profile"
      description="Manage tax profiles and rates."
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
              setEditTaxProfile(null);
              setDialogOpen(true);
            }}
          >
            <Plus aria-hidden="true" />
            Add Tax Profile
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

      <TaxProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        taxProfile={editTaxProfile}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteTaxProfile.isPending && setDeleteTarget(null)
        }
        title="Delete Tax Profile"
        description={`Are you sure you want to delete tax profile "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteTaxProfile.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTaxProfile.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Tax profile deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
