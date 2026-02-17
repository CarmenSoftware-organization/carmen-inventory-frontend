import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { PurchaseRequestTemplate } from "@/types/purchase-request";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UsePrtTableOptions {
  templates: PurchaseRequestTemplate[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (template: PurchaseRequestTemplate) => void;
  onDelete: (template: PurchaseRequestTemplate) => void;
}

export function usePrtTable({
  templates,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UsePrtTableOptions) {
  const columns: ColumnDef<PurchaseRequestTemplate>[] = [
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
    {
      accessorKey: "department_name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Department" />
      ),
    },
    {
      accessorKey: "workflow_name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Workflow" />
      ),
    },
  ];

  return useConfigTable<PurchaseRequestTemplate>({
    data: templates,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
