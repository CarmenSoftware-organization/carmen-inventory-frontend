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
  usePurchaseRequest,
  useMyPendingPurchaseRequest,
  usePurchaseRequestWorkflowStages,
  useDeletePurchaseRequest,
} from "@/hooks/use-purchase-request";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { PurchaseRequest } from "@/types/purchase-request";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PURCHASE_REQUEST_STATUS_OPTIONS } from "@/constant/purchase-request";
import { usePurchaseRequestTable } from "./pr-table";
import dynamic from "next/dynamic";

const CreatePRDialog = dynamic(() =>
  import("./pr-create-dialog").then((mod) => mod.CreatePRDialog),
);

export default function PurchaseRequestComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<PurchaseRequest | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"my-pending" | "all-document">(
    "my-pending",
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const deletePurchaseRequest = useDeletePurchaseRequest();
  const {
    params,
    search,
    setSearch,
    filter,
    setFilter,
    stage,
    setStage,
    tableConfig,
  } = useDataGridState();

  const { data: stages } = usePurchaseRequestWorkflowStages();
  const myPendingQuery = useMyPendingPurchaseRequest(params);
  const allDocumentQuery = usePurchaseRequest(params);
  const { data, isLoading, error, refetch } =
    viewMode === "my-pending" ? myPendingQuery : allDocumentQuery;

  const items = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = usePurchaseRequestTable({
    items,
    totalRecords,
    params,
    tableConfig,
    onEdit: (item) => router.push(`/procurement/purchase-request/${item.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Purchase Request"
      description="Manage purchase requests for your business."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter
            value={filter}
            onChange={setFilter}
            options={PURCHASE_REQUEST_STATUS_OPTIONS}
          />
        </>
      }
      actions={
        <>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus aria-hidden="true" />
            Add Request
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
      <div className="flex gap-2 items-center">
        <Button
          size={"sm"}
          variant={viewMode === "my-pending" ? "default" : "outline"}
          onClick={() => setViewMode("my-pending")}
        >
          My pending
        </Button>
        <Button
          size={"sm"}
          variant={viewMode === "all-document" ? "default" : "outline"}
          onClick={() => setViewMode("all-document")}
        >
          All Document
        </Button>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger size={"sm"} className="w-40 text-xs">
            <SelectValue placeholder="All Stage" />
          </SelectTrigger>
          <SelectContent>
            {(stages ?? []).map((stage) => (
              <SelectItem key={stage} value={stage} className="text-xs">
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataGrid
        table={table}
        recordCount={totalRecords}
        isLoading={isLoading}
        tableLayout={{ dense: true, headerSeparator: true }}
        tableClassNames={{ base: "text-sm" }}
      >
        <ScrollArea>
          <DataGridContainer>
            <DataGridTable />
          </DataGridContainer>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DataGridPagination />
      </DataGrid>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deletePurchaseRequest.isPending && setDeleteTarget(null)
        }
        title="Delete Purchase Request"
        description={`Are you sure you want to delete "${deleteTarget?.pr_no}"? This action cannot be undone.`}
        isPending={deletePurchaseRequest.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePurchaseRequest.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Purchase request deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
      <CreatePRDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </DisplayTemplate>
  );
}
