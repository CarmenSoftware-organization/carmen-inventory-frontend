import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/reui/cell-action";
import { useConfigTable } from "@/lib/data-grid/use-config-table";
import type { GoodsReceiveNote } from "@/types/goods-receive-note";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";

interface UseGrnTableOptions {
  goodsReceiveNotes: GoodsReceiveNote[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (grn: GoodsReceiveNote) => void;
  onDelete: (grn: GoodsReceiveNote) => void;
}

export function useGrnTable({
  goodsReceiveNotes,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseGrnTableOptions) {
  const { dateFormat } = useProfile();

  const columns: ColumnDef<GoodsReceiveNote>[] = [
    {
      accessorKey: "grn_number",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="GRN No." />
      ),
      cell: ({ row }) => (
        <CellAction onClick={() => onEdit(row.original)}>
          {row.getValue("grn_number")}
        </CellAction>
      ),
      size: 150,
    },
    {
      accessorKey: "grn_date",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Date" className="justify-center" />
      ),
      cell: ({ row }) => formatDate(row.getValue("grn_date"), dateFormat),
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
  ];

  return useConfigTable<GoodsReceiveNote>({
    data: goodsReceiveNotes,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
    hideStatus: true,
  });
}
