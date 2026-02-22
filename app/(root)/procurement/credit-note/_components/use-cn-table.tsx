import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { Badge } from "@/components/ui/badge";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { CreditNote } from "@/types/credit-note";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";

interface UseCnTableOptions {
  creditNotes: CreditNote[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (cn: CreditNote) => void;
  onDelete: (cn: CreditNote) => void;
}

export function useCnTable({
  creditNotes,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseCnTableOptions) {
  const { dateFormat } = useProfile();

  const columns: ColumnDef<CreditNote>[] = [
    {
      accessorKey: "credit_note_number",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="CN No." />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("credit_note_number")}
        </CellAction>
      ),
      size: 150,
    },
    {
      accessorKey: "credit_note_type",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue<string>("credit_note_type");
        return type === "quantity_return" ? "Quantity Return" : "Amount Discount";
      },
      size: 130,
    },
    {
      accessorKey: "credit_note_date",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Date" className="justify-center" />
      ),
      cell: ({ row }) => formatDate(row.getValue("credit_note_date"), dateFormat),
      meta: {
        cellClassName: "text-center",
      },
    },
    {
      accessorKey: "vendor_name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Vendor" />
      ),
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Total Amount" className="justify-end" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue<number>("total_amount");
        return (
          <span>
            {amount?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
      meta: {
        cellClassName: "text-right",
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const active = row.getValue("is_active");
        return (
          <Badge variant={active ? "success-light" : "warning-light"} size="sm">
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
      size: 80,
    },
  ];

  return useConfigTable<CreditNote>({
    data: creditNotes,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
    hideStatus: true,
  });
}
