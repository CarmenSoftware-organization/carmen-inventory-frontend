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
  "use no memo";

  const columns: ColumnDef<TaxProfile>[] = [
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
    data: taxProfiles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (params.perpage as number)),
  });
}
