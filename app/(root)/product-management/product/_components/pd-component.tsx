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
import { useProduct, useDeleteProduct } from "@/hooks/use-product";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Product } from "@/types/product";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import { useProductTable } from "./use-product-table";
import EmptyComponent from "@/components/empty-component";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const PRODUCT_STATUS_OPTIONS = [
  { label: "Active", value: "product_status_type|str:active" },
  { label: "Inactive", value: "product_status_type|str:inactive" },
];

export default function ProductComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const deleteProduct = useDeleteProduct();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useProduct(params);

  const products = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useProductTable({
    products,
    totalRecords,
    params,
    tableConfig,
    onEdit: (product) =>
      router.push(`/product-management/product/${product.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const handleAddItem = () => {
    router.push("/product-management/product/new");
  };

  const addNewBtn = (
    <Button size="sm" onClick={handleAddItem}>
      <Plus />
      Add New
    </Button>
  );

  return (
    <DisplayTemplate
      title="Product"
      description="Manage products for your inventory."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter
            value={filter}
            onChange={setFilter}
            options={PRODUCT_STATUS_OPTIONS}
          />
        </>
      }
      actions={
        <>
          {addNewBtn}
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
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-[11px]" }}
        isLoading={isLoading}
        emptyMessage={
          <EmptyComponent
            icon={BoxIcon}
            title="No Items Yet"
            description="Add items to this purchase order."
            content={addNewBtn}
          />
        }
      >
        <DataGridContainer>
          <ScrollArea className="w-full pb-4">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteProduct.isPending && setDeleteTarget(null)
        }
        title="Delete Product"
        description={`Are you sure you want to delete product "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteProduct.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteProduct.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Product deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
