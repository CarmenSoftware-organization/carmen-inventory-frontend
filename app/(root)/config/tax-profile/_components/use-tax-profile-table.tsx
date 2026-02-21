import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { TaxProfile } from "@/types/tax-profile";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseTaxProfileTableOptions {
  taxProfiles: TaxProfile[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (taxProfile: TaxProfile) => void;
  onDelete: (taxProfile: TaxProfile) => void;
}

export function useTaxProfileTable({
  taxProfiles,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseTaxProfileTableOptions) {
  const columns: ColumnDef<TaxProfile>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("name")}
        </CellAction>
      ),
    },
    {
      accessorKey: "tax_rate",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Rate"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <span>{row.getValue<number>("tax_rate")}%</span>
      ),
      size: 100,
      meta: {
        cellClassName: "text-right",
        headerClassName: "text-right",
      },
    },
  ];

  return useConfigTable<TaxProfile>({
    data: taxProfiles,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
