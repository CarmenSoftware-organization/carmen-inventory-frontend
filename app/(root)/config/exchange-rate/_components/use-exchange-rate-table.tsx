import { useMemo } from "react";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { useProfile } from "@/hooks/use-profile";
import type { ExchangeRateItem } from "@/types/exchange-rate";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { format, parseISO } from "date-fns";

interface UseExchangeRateTableOptions {
  items: ExchangeRateItem[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (item: ExchangeRateItem) => void;
}

export function useExchangeRateTable({
  items,
  totalRecords,
  params,
  tableConfig,
  onEdit,
}: UseExchangeRateTableOptions) {
  const { dateFormat } = useProfile();

  const fnsFormat = useMemo(() => {
    return (dateFormat ?? "DD/MM/YYYY")
      .replace("DD", "dd")
      .replace("MM", "MM")
      .replace("YYYY", "yyyy");
  }, [dateFormat]);

  const columns: ColumnDef<ExchangeRateItem>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => {
          const page = Number(params.page ?? 1);
          const perpage = Number(params.perpage ?? 10);
          return (page - 1) * perpage + row.index + 1;
        },
        size: 50,
      },
      {
        accessorKey: "at_date",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
          const raw = row.getValue<string>("at_date");
          try {
            return format(parseISO(raw), fnsFormat);
          } catch {
            return raw;
          }
        },
        size: 120,
      },
      {
        accessorKey: "currency_code",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Code" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left text-xs font-medium hover:underline"
            onClick={() => onEdit(row.original)}
          >
            {row.getValue("currency_code")}
          </button>
        ),
        size: 80,
      },
      {
        accessorKey: "exchange_rate",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Exchange Rate" />
        ),
        cell: ({ row }) => (
          <span className="block text-right">
            {row.getValue<number>("exchange_rate").toLocaleString()}
          </span>
        ),
        meta: { headerClassName: "text-right" },
      },
    ],
    [params.page, params.perpage, fnsFormat, onEdit],
  );

  return useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => `${row.currency_id}-${row.at_date}`,
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / Number(params.perpage ?? 10)),
  });
}
