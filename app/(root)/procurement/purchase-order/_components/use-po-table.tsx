import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import type { PurchaseOrder } from "@/types/purchase-order";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/currency-utils";

interface UsePoTableOptions {
  purchaseOrders: PurchaseOrder[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (po: PurchaseOrder) => void;
  onDelete: (po: PurchaseOrder) => void;
}

export function usePoTable({
  purchaseOrders,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UsePoTableOptions) {
  const { dateFormat } = useProfile();

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: "po_no",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="PO No." />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("po_no")}
        </CellAction>
      ),
      size: 120,
    },
    {
      accessorKey: "vendor_name",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Vendor" />
      ),
      size: 240,
    },
    {
      accessorKey: "order_date",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Order Date"
          className="justify-center"
        />
      ),
      cell: ({ row }) => formatDate(row.getValue("order_date"), dateFormat),
      meta: {
        cellClassName: "text-center",
      },
    },
    {
      accessorKey: "delivery_date",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Delivery Date"
          className="justify-center"
        />
      ),
      cell: ({ row }) => formatDate(row.getValue("delivery_date"), dateFormat),
      meta: {
        cellClassName: "text-center",
      },
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Total Amount"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const amount = row.getValue<number>("total_amount");
        return <span>{amount === null ? "" : formatCurrency(amount)}</span>;
      },
      meta: {
        cellClassName: "text-right",
      },
    },
  ];

  return useConfigTable<PurchaseOrder>({
    data: purchaseOrders,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
    hideStatus: true,
  });
}
