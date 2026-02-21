import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import { columnSkeletons } from "@/components/ui/data-grid/columns";
import type { Vendor } from "@/types/vendor";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseVendorTableOptions {
  vendors: Vendor[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

export function useVendorTable({
  vendors,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseVendorTableOptions) {
  const columns: ColumnDef<Vendor>[] = [
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
      meta: { skeleton: columnSkeletons.textShort },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "business_type_names",
      header: "Business Type",
      accessorFn: (row) =>
        row.business_type?.map((bt) => bt.name).join(", ") ?? "",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
  ];

  return useConfigTable<Vendor>({
    data: vendors,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
