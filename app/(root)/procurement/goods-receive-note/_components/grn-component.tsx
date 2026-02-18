"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoxIcon, Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import {
  useGoodsReceiveNote,
  useDeleteGoodsReceiveNote,
} from "@/hooks/use-goods-receive-note";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { GoodsReceiveNote } from "@/types/goods-receive-note";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useGrnTable } from "./use-grn-table";
import EmptyComponent from "@/components/empty-component";

export default function GrnComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<GoodsReceiveNote | null>(
    null,
  );
  const deleteGrn = useDeleteGoodsReceiveNote();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useGoodsReceiveNote(params);

  const goodsReceiveNotes = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const newgrn = () => {
    router.push("/procurement/goods-receive-note/new");
  };

  const newGrnBtn = (
    <Button size="sm" onClick={newgrn}>
      <Plus />
      Add Credit Note
    </Button>
  );

  const table = useGrnTable({
    goodsReceiveNotes,
    totalRecords,
    params,
    tableConfig,
    onEdit: (grn) => router.push(`/procurement/goods-receive-note/${grn.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Goods Receive Note"
      description="Manage goods receive notes for procurement."
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
            onClick={() => router.push("/procurement/goods-receive-note/new")}
          >
            <Plus />
            Add GRN
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
        emptyMessage={
          <EmptyComponent
            icon={BoxIcon}
            title="No Items Yet"
            description="Add items to this credit note."
            content={newGrnBtn}
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
          !open && !deleteGrn.isPending && setDeleteTarget(null)
        }
        title="Delete Goods Receive Note"
        description={`Are you sure you want to delete goods receive note "${deleteTarget?.grn_number}"? This action cannot be undone.`}
        isPending={deleteGrn.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteGrn.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Goods receive note deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
