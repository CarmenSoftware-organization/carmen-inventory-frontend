"use client";

import { useState, useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import {
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
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
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import EmptyComponent from "@/components/empty-component";

export interface PricelistEntry {
  vendor_id: string;
  vendor_name: string;
  pricelist_detail_id: string;
  pricelist_no: string;
  price: number;
  currency: string;
  unit_name: string;
  base_price: number;
  base_currency: string;
  exchange_rate: number;
  effective_date: { from: string; to: string };
  is_preferred?: boolean;
}

function buildColumns(dateFormat: string): ColumnDef<PricelistEntry>[] {
  return [
    {
      accessorKey: "vendor_name",
      header: "Vendor",
      size: 180,
    },
    {
      accessorKey: "pricelist_no",
      header: "Pricelist No",
      meta: { cellClassName: "text-muted-foreground" },
      size: 120,
    },
    {
      accessorKey: "unit_name",
      header: "Unit",
      meta: { cellClassName: "text-muted-foreground" },
      size: 80,
    },
    {
      accessorKey: "price",
      header: "Price",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      size: 80,
      cell: ({ getValue }) =>
        getValue<number>().toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      accessorKey: "currency",
      header: "Currency",
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
      size: 80,
    },
    {
      id: "effective",
      header: "Effective",
      meta: { cellClassName: "text-muted-foreground whitespace-nowrap" },
      cell: ({ row }) => {
        const { from, to } = row.original.effective_date ?? {};
        const f = formatDate(from, dateFormat);
        const t = formatDate(to, dateFormat);
        return f && t ? `${f} - ${t}` : "";
      },
    },
    {
      id: "select",
      header: "",
      size: 80,
      cell: () => (
        <Button type="button" size="xs">
          Select
        </Button>
      ),
    },
  ];
}

interface PrPricelistDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly productId: string;
  readonly productName: string;
  readonly unitId: string;
  readonly currencyId: string;
  readonly atDate: string;
  readonly requestedQty: number;
  readonly requestedUnitName: string;
  readonly approvedQty: number;
  readonly approvedUnitName: string;
  readonly onSelect: (entry: PricelistEntry) => void;
}

export function PrPricelistDialog({
  open,
  onOpenChange,
  productId,
  productName,
  unitId,
  currencyId,
  atDate,
  requestedQty,
  requestedUnitName,
  approvedQty,
  approvedUnitName,
  onSelect,
}: PrPricelistDialogProps) {
  const { buCode, dateFormat } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [lists, setLists] = useState<PricelistEntry[]>([]);

  useEffect(() => {
    if (!open || !productId || !unitId || !currencyId) return;

    const fetchPriceLists = async () => {
      setIsLoading(true);
      setLists([]);
      try {
        const url = buildUrl(
          `/api/proxy/api/${buCode}/price-list/price-compare`,
          {
            product_id: productId,
            unit_id: unitId,
            at_date: atDate,
            currency_id: currencyId,
          },
        );
        const res = await httpClient.get(url);
        if (!res.ok) return;
        const json = await res.json();
        setLists(json.data?.lists ?? []);
      } catch {
        toast.error("Failed to load price lists");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceLists();
  }, [open, productId, unitId, currencyId, atDate, buCode]);

  const handleSelect = (entry: PricelistEntry) => {
    onSelect(entry);
    onOpenChange(false);
  };

  const pricelistColumns = useMemo(
    () => buildColumns(dateFormat),
    [dateFormat],
  );

  const table = useReactTable({
    data: lists,
    columns: pricelistColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.pricelist_detail_id,
  });

  const emptyMessage = useMemo(
    () => (
      <EmptyComponent
        icon={FileText}
        title="No Price List Found"
        description="No price list found for this item."
      />
    ),
    [],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Price List Comparison</DialogTitle>
          <DialogDescription className="text-sm">
            {productName} — Req: {requestedQty} {requestedUnitName}
            {approvedQty > 0 && ` · Apv: ${approvedQty} ${approvedUnitName}`}
          </DialogDescription>
        </DialogHeader>
        <DataGrid
          table={table}
          recordCount={lists.length}
          isLoading={isLoading}
          loadingMode="spinner"
          emptyMessage={emptyMessage}
          onRowClick={handleSelect}
          tableLayout={{ dense: true, headerBackground: true }}
          tableClassNames={{ base: "text-xs" }}
        >
          <DataGridContainer>
            <DataGridTable />
          </DataGridContainer>
        </DataGrid>
      </DialogContent>
    </Dialog>
  );
}
