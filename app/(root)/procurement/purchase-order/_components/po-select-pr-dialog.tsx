"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { usePurchaseRequest } from "@/hooks/use-purchase-request";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import type { PurchaseRequest } from "@/types/purchase-request";
import EmptyComponent from "@/components/empty-component";
import { FileText } from "lucide-react";

interface SelectPRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (prId: string) => void;
}

export function SelectPRDialog({
  open,
  onOpenChange,
  onSelect,
}: SelectPRDialogProps) {
  "use no memo";

  const { dateFormat } = useProfile();
  const { data, isLoading } = usePurchaseRequest({ perpage: 9999 });
  const purchaseRequests = data?.data ?? [];

  const columns: ColumnDef<PurchaseRequest>[] = [
    {
      accessorKey: "pr_no",
      header: "PR No.",
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline text-left text-xs"
          onClick={() => onSelect(row.original.id)}
        >
          {row.getValue("pr_no")}
        </button>
      ),
      size: 150,
    },
    {
      accessorKey: "pr_date",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("pr_date"), dateFormat),
      size: 100,
    },
    {
      accessorKey: "requestor_name",
      header: "Requestor",
    },
    {
      accessorKey: "department_name",
      header: "Department",
      size: 120,
    },
  ];

  const table = useReactTable({
    data: purchaseRequests,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Purchase Request</DialogTitle>
          <DialogDescription>
            Choose a purchase request to create a purchase order from.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataGrid
            table={table}
            recordCount={purchaseRequests.length}
            tableLayout={{ dense: true }}
            tableClassNames={{ base: "text-xs" }}
            emptyMessage={
              <EmptyComponent
                icon={FileText}
                title="No Purchase Requests"
                description="No purchase requests available."
              />
            }
          >
            <DataGridContainer className="max-h-80">
              <DataGridTable />
            </DataGridContainer>
          </DataGrid>
        )}
      </DialogContent>
    </Dialog>
  );
}
