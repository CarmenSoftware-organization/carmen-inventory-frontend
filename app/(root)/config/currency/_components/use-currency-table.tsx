import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/reui/data-grid/data-grid-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@/components/reui/badge";
import { DataGridRowActions } from "@/components/reui/data-grid/data-grid-row-actions";
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
  "use no memo";

  const { defaultCurrencyCode, defaultCurrencyDecimalPlaces } = useProfile();

  const columns: ColumnDef<Currency>[] = [
    {
      id: "select",
      header: () => (
        <div className="flex justify-center">
          <DataGridTableRowSelectAll />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DataGridTableRowSelect row={row} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 20,
    },
    {
      id: "index",
      header: "#",
      cell: ({ row }) =>
        row.index +
        1 +
        ((Number(params.page) || 1) - 1) * (Number(params.perpage) || 10),
      enableSorting: false,
      enableHiding: false,
      size: 20,
    },
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
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Status"
          className="justify-center"
        />
      ),
      cell: ({ row }) => (
        <Badge
          size="sm"
          variant={row.getValue("is_active") ? "success" : "destructive"}
        >
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </Badge>
      ),
      size: 100,
      meta: {
        cellClassName: "text-center",
        headerClassName: "text-center",
      },
    },
    {
      id: "action",
      header: () => "",
      cell: ({ row }) => (
        <DataGridRowActions onDelete={() => onDelete(row.original)} />
      ),
      enableSorting: false,
      size: 40,
    },
  ];

  return useReactTable({
    data: currencies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (params.perpage as number)),
  });
}
