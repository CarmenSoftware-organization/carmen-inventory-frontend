import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { BusinessType } from "@/types/business-type";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseBusinessTypeTableOptions {
  businessTypes: BusinessType[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (businessType: BusinessType) => void;
  onDelete: (businessType: BusinessType) => void;
}

export function useBusinessTypeTable({
  businessTypes,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseBusinessTypeTableOptions) {
  const columns: ColumnDef<BusinessType>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("name")}
        </button>
      ),
    },
  ];

  return useConfigTable<BusinessType>({
    data: businessTypes,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
