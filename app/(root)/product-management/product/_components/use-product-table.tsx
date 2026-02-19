import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { Badge } from "@/components/ui/badge";
import {
  selectColumn,
  indexColumn,
  actionColumn,
  columnSkeletons,
} from "@/components/ui/data-grid/columns";
import type { Product } from "@/types/product";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseProductTableOptions {
  products: Product[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function useProductTable({
  products,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseProductTableOptions) {
  "use no memo";

  const dataColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          <Badge size={"xs"} variant={"secondary"}>
            {row.original.code}
          </Badge>{" "}
          - {row.original.name}
        </CellAction>
      ),
      size: 350,
      meta: { skeleton: columnSkeletons.textShort },
    },
    {
      accessorKey: "local_name",
      header: "Local Name",
      enableSorting: false,
      size: 300,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "inventory_unit_name",
      accessorFn: (row) => row.inventory_unit?.name ?? "",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Unit" />
      ),
      meta: { skeleton: columnSkeletons.textShort },
    },
    {
      id: "product_item_group_name",
      accessorFn: (row) => row.product_item_group?.name ?? "",
      header: "Item Group",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "product_sub_category",
      accessorFn: (row) => row.product_sub_category?.name ?? "",
      header: "Sub Category",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "product_category_name",
      accessorFn: (row) => row.product_category?.name ?? "",
      header: "Category",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "product_status_type",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Status"
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const status = row.getValue<string>("product_status_type");
        return (
          <Badge
            size="sm"
            variant={status === "active" ? "success" : "destructive"}
          >
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        );
      },
      size: 100,
      enableSorting: false,
      meta: {
        cellClassName: "text-center",
        headerClassName: "text-center",
        skeleton: columnSkeletons.badge,
      },
    },
  ];

  const allColumns: ColumnDef<Product>[] = [
    selectColumn<Product>(),
    indexColumn<Product>(params),
    ...dataColumns,
    actionColumn<Product>(onDelete),
  ];

  return useReactTable({
    data: products,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (Number(params.perpage) || 10)),
  });
}
