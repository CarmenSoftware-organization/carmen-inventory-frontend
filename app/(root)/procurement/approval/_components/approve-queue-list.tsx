"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Clock } from "lucide-react";
import { PR_STATUS_CONFIG } from "@/constant/purchase-request";
import type { ApprovalItem } from "@/types/approval";
import { formatDate } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  columnSkeletons,
  indexColumn,
} from "@/components/ui/data-grid/columns";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import type { useDataGridState } from "@/hooks/use-data-grid-state";
import type { ParamsDto } from "@/types/params";
import EmptyComponent from "@/components/empty-component";

const DOC_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    variant: "info" | "warning" | "default";
    href: (id: string) => string;
  }
> = {
  pr: {
    label: "PR",
    variant: "info",
    href: (id) => `/procurement/purchase-request/${id}`,
  },
  po: {
    label: "PO",
    variant: "warning",
    href: (id) => `/procurement/purchase-order/${id}`,
  },
  sr: {
    label: "SR",
    variant: "default",
    href: (id) => `/store-operation/store-requisition/${id}`,
  },
};

interface ApprovalQueueListProps {
  readonly items: ApprovalItem[];
  readonly totalRecords: number;
  readonly isLoading: boolean;
  readonly dateFormat: string;
  readonly params: ParamsDto;
  readonly tableConfig: ReturnType<typeof useDataGridState>["tableConfig"];
}

export default function ApprovalQueueList({
  items,
  totalRecords,
  isLoading,
  dateFormat,
  params,
  tableConfig,
}: ApprovalQueueListProps) {
  const columns: ColumnDef<ApprovalItem>[] = [
    indexColumn<ApprovalItem>(params),
    {
      accessorKey: "doc_no",
      header: "Document",
      cell: ({ row }) => {
        const item = row.original;

        const href = DOC_TYPE_CONFIG[item.doc_type]?.href(item.id) ?? "#";
        return (
          <Link
            href={href}
            className="font-medium hover:underline text-left text-xs"
          >
            {item.doc_no}
          </Link>
        );
      },
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "doc_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant={
            DOC_TYPE_CONFIG[row.original.doc_type]?.variant ?? "secondary"
          }
          size="xs"
        >
          {DOC_TYPE_CONFIG[row.original.doc_type]?.label ??
            row.original.doc_type.toUpperCase()}
        </Badge>
      ),
      size: 60,
      meta: {
        cellClassName: "text-center",
        headerClassName: "text-center",
        skeleton: columnSkeletons.badge,
      },
    },

    {
      accessorKey: "doc_date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.doc_date, dateFormat)}
        </span>
      ),
      size: 100,
      meta: { skeleton: columnSkeletons.text },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config =
          PR_STATUS_CONFIG[status ?? "draft"] ?? PR_STATUS_CONFIG.draft;
        return (
          <Badge variant={config.variant} size="xs">
            {config.label}
          </Badge>
        );
      },
      size: 100,
      meta: {
        cellClassName: "text-center",
        headerClassName: "text-center",
        skeleton: columnSkeletons.badge,
      },
    },
  ];

  const pageSize = tableConfig.state.pagination.pageSize;

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableConfig,
    pageCount: Math.ceil(totalRecords / pageSize),
  });

  if (!isLoading && items.length === 0) {
    return (
      <EmptyComponent
        icon={Clock}
        title="No pending approvals"
        description="You have no documents waiting for your approval at the moment."
      />
    );
  }

  return (
    <DataGrid
      table={table}
      recordCount={totalRecords}
      isLoading={isLoading}
      tableClassNames={{ base: "text-xs" }}
    >
      <DataGridContainer>
        <DataGridTable />
      </DataGridContainer>
      <DataGridPagination />
    </DataGrid>
  );
}
