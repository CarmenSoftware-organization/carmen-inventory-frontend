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
  usePriceListTemplate,
  useDeletePriceListTemplate,
} from "@/hooks/use-price-list-template";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { PriceListTemplate } from "@/types/price-list-template";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { usePriceListTemplateTable } from "./use-price-list-template-table";

const statusOptions = [
  { label: "Draft", value: "status|string:draft" },
  { label: "Active", value: "status|string:active" },
  { label: "Inactive", value: "status|string:inactive" },
];

export default function PriceListTemplateComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<PriceListTemplate | null>(
    null,
  );
  const deletePriceListTemplate = useDeletePriceListTemplate();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = usePriceListTemplate(params);

  const templates = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = usePriceListTemplateTable({
    templates,
    totalRecords,
    params,
    tableConfig,
    onEdit: (template) =>
      router.push(`/vendor-management/price-list-template/${template.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Price List Template"
      description="Manage price list templates for your business."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter
            value={filter}
            onChange={setFilter}
            options={statusOptions}
          />
        </>
      }
      actions={
        <>
          <Button
            size="sm"
            onClick={() =>
              router.push("/vendor-management/price-list-template/new")
            }
          >
            <Plus />
            Add Template
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
          !open && !deletePriceListTemplate.isPending && setDeleteTarget(null)
        }
        title="Delete Price List Template"
        description={`Are you sure you want to delete template "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deletePriceListTemplate.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deletePriceListTemplate.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Price list template deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
