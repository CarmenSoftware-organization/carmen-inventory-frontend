import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import { useProfile } from "@/hooks/use-profile";
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
        <DataGridColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("code")}
        </button>
      ),
      size: 80,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "symbol",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Symbol" />
      ),
      size: 80,
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
      cell: ({ row }) => {
        const rate = row.getValue<number>("exchange_rate");
        if (!rate) return <span>-</span>;
        const convertedAmount = 1 / rate;
        return (
          <span>
            {convertedAmount.toLocaleString(undefined, {
              minimumFractionDigits: defaultCurrencyDecimalPlaces ?? 2,
              maximumFractionDigits: defaultCurrencyDecimalPlaces ?? 4,
            })}{" "}
            {defaultCurrencyCode}
          </span>
        );
      },
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
