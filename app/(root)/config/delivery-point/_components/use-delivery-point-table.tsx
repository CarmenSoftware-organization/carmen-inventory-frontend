import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { DeliveryPoint } from "@/types/delivery-point";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseDeliveryPointTableOptions {
  deliveryPoints: DeliveryPoint[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (deliveryPoint: DeliveryPoint) => void;
  onDelete: (deliveryPoint: DeliveryPoint) => void;
}

export function useDeliveryPointTable({
  deliveryPoints,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseDeliveryPointTableOptions) {
  const columns: ColumnDef<DeliveryPoint>[] = [
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

  return useConfigTable<DeliveryPoint>({
    data: deliveryPoints,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
