"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/ui/data-grid/data-grid-column-header";
import { CellAction } from "@/components/ui/cell-action";
import { useConfigTable } from "@/components/ui/data-grid/use-config-table";
import { columnSkeletons } from "@/components/ui/data-grid/columns";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import type { RequestPriceList, StatusRfp } from "@/types/request-price-list";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UseRequestPriceListTableOptions {
  items: RequestPriceList[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (item: RequestPriceList) => void;
  onDelete: (item: RequestPriceList) => void;
}

const statusVariantMap: Record<
  StatusRfp,
  "outline" | "success" | "info" | "destructive" | "secondary"
> = {
  draft: "outline",
  active: "success",
  submit: "info",
  completed: "success",
  inactive: "destructive",
};

const statusLabelMap: Record<StatusRfp, string> = {
  draft: "Draft",
  active: "Active",
  submit: "Submit",
  completed: "Completed",
  inactive: "Inactive",
};

export function useRequestPriceListTable({
  items,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UseRequestPriceListTableOptions) {
  const { dateFormat } = useProfile();

  const formatPeriod = (startDate: string, endDate: string): string => {
    const from = formatDate(startDate, dateFormat);
    const to = formatDate(endDate, dateFormat);
    if (!from && !to) return "—";
    return `${from} - ${to}`;
  };

  const columns: ColumnDef<RequestPriceList>[] = [
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
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status") as StatusRfp | undefined;
        if (!status) return "—";
        return (
          <Badge
            size="sm"
            variant={statusVariantMap[status] ?? "outline"}
          >
            {statusLabelMap[status] ?? status}
          </Badge>
        );
      },
      enableSorting: false,
      meta: { skeleton: columnSkeletons.badge },
    },
    {
      id: "template_name",
      accessorFn: (row) => row.pricelist_template?.name ?? "",
      header: "Template",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      id: "period",
      accessorFn: (row) => formatPeriod(row.start_date, row.end_date),
      header: "Period",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "vendor_count",
      header: "Vendors",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.textShort },
    },
  ];

  return useConfigTable<RequestPriceList>({
    data: items,
    columns,
    totalRecords,
    params,
    tableConfig,
    onDelete,
    hideStatus: true,
  });
}
