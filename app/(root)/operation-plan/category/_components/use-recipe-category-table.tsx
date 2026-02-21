import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { RecipeCategory } from "@/types/recipe-category";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseRecipeCategoryTableOptions {
  categories: RecipeCategory[];
  allCategories: RecipeCategory[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (category: RecipeCategory) => void;
  onDelete: (category: RecipeCategory) => void;
}

export function useRecipeCategoryTable({
  categories,
  allCategories,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseRecipeCategoryTableOptions) {
  const columns: ColumnDef<RecipeCategory>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("code")}
        </CellAction>
      ),
      size: 120,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "parent_id",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Parent" />
      ),
      cell: ({ row }) => {
        const parentId = row.original.parent_id;
        if (!parentId) return <span className="text-muted-foreground">—</span>;
        const parent = allCategories.find((c) => c.id === parentId);
        return parent?.name ?? parentId;
      },
    },
  ];

  return useConfigTable<RecipeCategory>({
    data: categories,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
