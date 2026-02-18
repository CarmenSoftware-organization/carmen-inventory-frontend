import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import { useProfile } from "@/hooks/use-profile";
import { formatExchangeRate } from "@/lib/currency-utils";
import type { Currency } from "@/types/currency";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseCurrencyTableOptions {
  currencies: Currency[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
}

export function useCurrencyTable({
  currencies,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseCurrencyTableOptions) {
  const { defaultCurrencyCode, defaultCurrencyDecimalPlaces } = useProfile();

  const columns: ColumnDef<Currency>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Code"
          className="justify-center"
        />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("code")}
        </button>
      ),
      size: 80,
      meta: {
        cellClassName: "text-center",
        headerClassName: "text-center",
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "symbol",
      header: "Symbol",
      size: 80,
      enableSorting: false,
      meta: {
        cellClassName: "text-center",
        headerClassName: "text-center",
      },
    },
    {
      accessorKey: "exchange_rate",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Exchange Rate"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <span>
          {formatExchangeRate(
            row.getValue<number>("exchange_rate"),
            defaultCurrencyDecimalPlaces,
            defaultCurrencyCode,
          )}
        </span>
      ),
      size: 120,
      meta: {
        cellClassName: "text-right",
        headerClassName: "text-right",
      },
    },
  ];

  return useConfigTable<Currency>({
    data: currencies,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
  });
}
