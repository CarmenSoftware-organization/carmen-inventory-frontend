import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { PeriodEnd } from "@/types/period-end";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UsePeriodEndTableOptions {
  periodEnds: PeriodEnd[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (periodEnd: PeriodEnd) => void;
  onDelete: (periodEnd: PeriodEnd) => void;
}

export function usePeriodEndTable({
  periodEnds,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UsePeriodEndTableOptions) {
  const columns: ColumnDef<PeriodEnd>[] = [
    {
      accessorKey: "pe_no",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="PE No." />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("pe_no")}
        </button>
      ),
      size: 200,
    },
  ];

  return useConfigTable<PeriodEnd>({
    data: periodEnds,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
