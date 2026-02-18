"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { PR_ITEM_STATUS_CONFIG } from "@/constant/purchase-request";
import type { PurchaseRequestDetail } from "@/types/purchase-request";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ApprovalItemTableProps {
  readonly details: PurchaseRequestDetail[];
}

const columns: ColumnDef<PurchaseRequestDetail>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    size: 32,
    meta: {
      headerClassName: "text-center",
      cellClassName: "text-center text-muted-foreground",
    },
  },
  {
    accessorKey: "product_name",
    header: "Product",
    size: 200,
  },
  {
    accessorKey: "location_name",
    header: "Location",
    size: 150,
  },
  {
    accessorKey: "current_stage_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("current_stage_status") as string;
      const config =
        PR_ITEM_STATUS_CONFIG[status] ?? PR_ITEM_STATUS_CONFIG.pending;
      return (
        <Badge variant={config.variant} className="text-[11px]">
          {config.label}
        </Badge>
      );
    },
    size: 80,
    meta: {
      cellClassName: "text-center",
      headerClassName: "text-center",
    },
  },
  {
    id: "requested",
    header: "Requested",
    cell: ({ row }) =>
      `${row.original.requested_qty} ${row.original.requested_unit_name}`,
    size: 110,
    meta: {
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
  },
  {
    id: "approved",
    header: "Approved",
    cell: ({ row }) =>
      `${row.original.approved_qty} ${row.original.approved_unit_name}`,
    size: 110,
    meta: {
      cellClassName: "text-right",
      headerClassName: "text-right",
    },
  },
  {
    accessorKey: "vendor_name",
    header: "Vendor",
    cell: ({ row }) => row.getValue("vendor_name") || "\u2014",
    size: 150,
  },
  {
    id: "unit_price",
    header: "Unit Price",
    cell: ({ row }) =>
      row.original.pricelist_price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    size: 100,
    meta: {
      cellClassName: "text-right tabular-nums",
      headerClassName: "text-right",
    },
  },
  {
    id: "total",
    header: "Total",
    cell: ({ row }) =>
      row.original.total_price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    size: 100,
    meta: {
      cellClassName: "text-right tabular-nums font-medium",
      headerClassName: "text-right",
    },
  },
  {
    accessorKey: "delivery_point_name",
    header: "Delivery Point",
    size: 150,
  },
];

export function ApprovalItemTable({ details }: ApprovalItemTableProps) {
  const table = useReactTable({
    data: details,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={details.length}
      tableLayout={{ dense: true }}
      tableClassNames={{ base: "text-xs" }}
    >
      <ScrollArea>
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </DataGrid>
  );
}
