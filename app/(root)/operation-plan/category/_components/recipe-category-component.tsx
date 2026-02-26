"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Layers, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import {
  useRecipeCategory,
  useDeleteRecipeCategory,
} from "@/hooks/use-recipe-category";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { RecipeCategory } from "@/types/recipe-category";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import EmptyComponent from "@/components/empty-component";
import { useRecipeCategoryTable } from "./use-recipe-category-table";

export default function RecipeCategoryComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<RecipeCategory | null>(
    null,
  );
  const deleteCategory = useDeleteRecipeCategory();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useRecipeCategory(params);
  const { data: allData } = useRecipeCategory({ perpage: -1 });

  const categories = data?.data ?? [];
  const allCategories = allData?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useRecipeCategoryTable({
    categories,
    allCategories,
    totalRecords,
    params,
    tableConfig,
    onEdit: (category) =>
      router.push(`/operation-plan/category/${category.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Recipe Category"
      description="Manage recipe categories."
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
            onClick={() => router.push("/operation-plan/category/new")}
          >
            <Plus />
            Add Category
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
        emptyMessage={
          <EmptyComponent
            icon={Layers}
            title="No Categories"
            description="No recipe categories found."
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
          !open && !deleteCategory.isPending && setDeleteTarget(null)
        }
        title="Delete Recipe Category"
        description={`Are you sure you want to delete recipe category "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteCategory.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCategory.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Recipe category deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
