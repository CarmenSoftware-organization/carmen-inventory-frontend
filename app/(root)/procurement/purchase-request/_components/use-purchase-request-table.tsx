"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import {
  selectColumn,
  indexColumn,
  actionColumn,
  columnSkeletons,
} from "@/lib/data-grid/columns";
import { Badge } from "@/components/reui/badge";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import type {
  PurchaseRequest,
  PurchaseRequestStatus,
} from "@/types/purchase-request";
import type { ParamsDto } from "@/types/params";
import type { useDataGridState } from "@/hooks/use-data-grid-state";

interface UsePurchaseRequestTableOptions {
  items: PurchaseRequest[];
  totalRecords: number;
  params: ParamsDto;
  tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
  onEdit: (item: PurchaseRequest) => void;
  onDelete: (item: PurchaseRequest) => void;
}

const statusVariantMap: Record<
  PurchaseRequestStatus,
  "outline" | "secondary" | "success" | "destructive"
> = {
  draft: "outline",
  submitted: "secondary",
  approved: "success",
  rejected: "destructive",
  in_progress: "secondary",
  completed: "success",
  voided: "outline",
};

export function usePurchaseRequestTable({
  items,
  totalRecords,
  params,
  tableConfig,
  onEdit,
  onDelete,
}: UsePurchaseRequestTableOptions) {
  const { dateFormat } = useProfile();

  const dataColumns: ColumnDef<PurchaseRequest>[] = [
    {
      accessorKey: "pr_no",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="PR No." />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onEdit(row.original)}
        >
          {row.getValue("pr_no")}
        </button>
      ),
      size: 220,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "pr_date",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("pr_date"), dateFormat),
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "workflow_name",
      header: "Type",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "pr_status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue("pr_status") as PurchaseRequestStatus;
        return (
          <Badge variant={statusVariantMap[status]} size="sm">
            {status}
          </Badge>
        );
      },
      meta: { skeleton: columnSkeletons.badge },
    },
    {
      accessorKey: "workflow_current_stage",
      header: "Stage",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "requestor_name",
      header: "Requestor",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "department_name",
      header: "Department",
      enableSorting: false,
      meta: { skeleton: columnSkeletons.text },
    },
  ];

  const allColumns: ColumnDef<PurchaseRequest>[] = [
    selectColumn<PurchaseRequest>(),
    indexColumn<PurchaseRequest>(params),
    ...dataColumns,
    actionColumn<PurchaseRequest>(onDelete),
  ];

  return useReactTable({
    data: items,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / (Number(params.perpage) || 10)),
  });
}
