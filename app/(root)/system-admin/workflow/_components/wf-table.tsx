import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import { Badge } from "@/components/ui/badge";
import type { WorkflowDto } from "@/types/workflows";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

const typeLabels: Record<string, string> = {
  purchase_request_workflow: "Purchase Request",
  store_requisition_workflow: "Store Requisition",
  purchase_order_workflow: "Purchase Order",
};

interface UseWfTableOptions {
  workflows: WorkflowDto[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (workflow: WorkflowDto) => void;
  onDelete: (workflow: WorkflowDto) => void;
}

export function useWfTable({
  workflows,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseWfTableOptions) {
  const columns: ColumnDef<WorkflowDto>[] = [
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
      accessorKey: "workflow_type",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-normal">
          {typeLabels[row.getValue("workflow_type") as string] ??
            row.getValue("workflow_type")}
        </Badge>
      ),
      size: 180,
    },
  ];

  return useConfigTable<WorkflowDto>({
    data: workflows,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
