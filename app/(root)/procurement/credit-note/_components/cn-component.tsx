"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { File, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useCreditNote, useDeleteCreditNote } from "@/hooks/use-credit-note";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { CreditNote } from "@/types/credit-note";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useCnTable } from "./use-cn-table";
import EmptyComponent from "@/components/empty-component";

export default function CnComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<CreditNote | null>(null);
  const deleteCn = useDeleteCreditNote();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useCreditNote(params);

  const creditNotes = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useCnTable({
    creditNotes,
    totalRecords,
    params,
    tableConfig,
    onEdit: (cn) => router.push(`/procurement/credit-note/${cn.id}`),
    onDelete: setDeleteTarget,
  });

  const newCreditnote = () => {
    router.push("/procurement/credit-note/new");
  };

  const newCnBtn = (
    <Button size="sm" onClick={newCreditnote}>
      <Plus />
      Add Credit Note
    </Button>
  );

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Credit Note"
      description="Manage credit notes."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={newCnBtn}
    >
      <DataGrid
        table={table}
        recordCount={totalRecords}
        isLoading={isLoading}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
        emptyMessage={
          <EmptyComponent
            icon={File}
            title="No Credit Notes"
            description="No credit notes found."
            content={newCnBtn}
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
          !open && !deleteCn.isPending && setDeleteTarget(null)
        }
        title="Delete Credit Note"
        description={`Are you sure you want to delete credit note "${deleteTarget?.credit_note_number}"? This action cannot be undone.`}
        isPending={deleteCn.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCn.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Credit note deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
