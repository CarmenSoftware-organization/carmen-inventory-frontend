import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { Equipment } from "@/types/equipment";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseEquipmentTableOptions {
  equipments: Equipment[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
}

export function useEquipmentTable({
  equipments,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseEquipmentTableOptions) {
  const columns: ColumnDef<Equipment>[] = [
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
      accessorKey: "brand",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Brand" />
      ),
      size: 140,
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Model" />
      ),
      size: 140,
    },
    {
      accessorKey: "station",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Station" />
      ),
      size: 140,
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Capacity" />
      ),
      size: 120,
    },
  ];

  return useConfigTable<Equipment>({
    data: equipments,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
