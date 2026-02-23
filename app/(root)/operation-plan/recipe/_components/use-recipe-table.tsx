import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { Badge } from "@/components/ui/badge";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { Recipe } from "@/types/recipe";
import type { Cuisine } from "@/types/cuisine";
import type { RecipeCategory } from "@/types/recipe-category";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { RECIPE_STATUS, RECIPE_DIFFICULTY } from "@/constant/recipe";
import { formatCurrency } from "@/lib/currency-utils";
import type { BadgeProps } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  [RECIPE_STATUS.DRAFT]: "secondary",
  [RECIPE_STATUS.PUBLISHED]: "success",
  [RECIPE_STATUS.ARCHIVED]: "warning",
};

interface UseRecipeTableOptions {
  recipes: Recipe[];
  cuisines: Cuisine[];
  categories: RecipeCategory[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function useRecipeTable({
  recipes,
  cuisines,
  categories,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseRecipeTableOptions) {
  const cuisineMap = useMemo(
    () => new Map(cuisines.map((c) => [c.id, c.name])),
    [cuisines],
  );
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const columns: ColumnDef<Recipe>[] = [
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
      accessorKey: "cuisine_id",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Cuisine" />
      ),
      cell: ({ row }) => {
        const name = cuisineMap.get(row.original.cuisine_id);
        return name ?? <span className="text-muted-foreground">—</span>;
      },
      size: 150,
    },
    {
      accessorKey: "category_id",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const name = categoryMap.get(row.original.category_id);
        return name ?? <span className="text-muted-foreground">—</span>;
      },
      size: 150,
    },
    {
      accessorKey: "difficulty",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Difficulty" />
      ),
      cell: ({ row }) => {
        const d = row.getValue<string>("difficulty");
        let variant: BadgeProps["variant"] = "success-light";
        if (d === RECIPE_DIFFICULTY.HARD) variant = "destructive-light";
        else if (d === RECIPE_DIFFICULTY.MEDIUM) variant = "warning-light";
        return (
          <Badge size="sm" variant={variant}>
            {d}
          </Badge>
        );
      },
      size: 100,
    },
    {
      id: "total_time",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Total Time" />
      ),
      cell: ({ row }) => {
        const total = row.original.prep_time + row.original.cook_time;
        if (total === 0)
          return <span className="text-muted-foreground">—</span>;
        return `${total} min`;
      },
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: "cost_per_portion",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Cost/Portion"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const val = row.getValue<number>("cost_per_portion");
        return val > 0 ? (
          <span className="text-right">{formatCurrency(val)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      meta: { cellClassName: "text-right" },
      size: 110,
    },
    {
      accessorKey: "selling_price",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Selling Price"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const val = row.getValue<number | null>("selling_price");
        return val != null && val > 0 ? (
          <span className="text-right">{formatCurrency(val)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      meta: { cellClassName: "text-right" },
      size: 110,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return (
          <Badge size="sm" variant={STATUS_VARIANT[status] ?? "secondary"}>
            {status}
          </Badge>
        );
      },
      size: 120,
    },
  ];

  return useConfigTable<Recipe>({
    data: recipes,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
