"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useRecipe, useDeleteRecipe } from "@/hooks/use-recipe";
import { useCuisine } from "@/hooks/use-cuisine";
import { useRecipeCategory } from "@/hooks/use-recipe-category";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Recipe } from "@/types/recipe";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
import DisplayTemplate from "@/components/display-template";
import EmptyComponent from "@/components/empty-component";
import { useRecipeTable } from "./use-recipe-table";

export default function RecipeComponent() {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const deleteRecipe = useDeleteRecipe();
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useRecipe(params);
  const { data: cuisineData } = useCuisine({ perpage: -1 });
  const { data: categoryData } = useRecipeCategory({ perpage: -1 });

  const recipes = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useRecipeTable({
    recipes,
    cuisines: cuisineData?.data ?? [],
    categories: categoryData?.data ?? [],
    totalRecords,
    params,
    tableConfig,
    onEdit: (recipe) => router.push(`/operation-plan/recipe/${recipe.id}`),
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Recipe"
      description="Manage recipes for your operational planning."
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
            onClick={() => router.push("/operation-plan/recipe/new")}
          >
            <Plus aria-hidden="true" />
            Add Recipe
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
        emptyMessage={
          <EmptyComponent
            icon={BookOpen}
            title="No Recipes"
            description="No recipes found."
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
          !open && !deleteRecipe.isPending && setDeleteTarget(null)
        }
        title="Delete Recipe"
        description={`Are you sure you want to delete recipe "${deleteTarget?.name}"? This action cannot be undone.`}
        isPending={deleteRecipe.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteRecipe.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Recipe deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
