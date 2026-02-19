"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useCurrency, useDeleteCurrency } from "@/hooks/use-currency";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import type { Currency } from "@/types/currency";
import SearchInput from "@/components/search-input";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { StatusFilter } from "@/components/ui/status-filter";
const CurrencyDialog = dynamic(() =>
  import("./currency-dialog").then((mod) => mod.CurrencyDialog),
);
import DisplayTemplate from "@/components/display-template";
import { useCurrencyTable } from "./use-currency-table";

export default function CurrencyComponent() {
  const [deleteTarget, setDeleteTarget] = useState<Currency | null>(null);
  const deleteCurrency = useDeleteCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null);
  const { params, search, setSearch, filter, setFilter, tableConfig } =
    useDataGridState();
  const { data, isLoading, error, refetch } = useCurrency(params);

  const currencies = data?.data ?? [];
  const totalRecords = data?.paginate?.total ?? 0;

  const table = useCurrencyTable({
    currencies,
    totalRecords,
    params,
    tableConfig,
    onEdit: (currency) => {
      setEditCurrency(currency);
      setDialogOpen(true);
    },
    onDelete: setDeleteTarget,
  });

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <DisplayTemplate
      title="Currency"
      description="Manage currencies and exchange rates."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <StatusFilter value={filter} onChange={setFilter} />
        </>
      }
      actions={
        <>
          <Button
            size="sm"
            onClick={() => {
              setEditCurrency(null);
              setDialogOpen(true);
            }}
          >
            <Plus />
            Add Currency
          </Button>
          <Button size="sm" variant="outline">
            <Download />
            Export
          </Button>
          <Button size="sm" variant="outline">
            <Printer />
            Print
          </Button>
        </>
      }
    >
      <DataGrid
        table={table}
        recordCount={totalRecords}
        isLoading={isLoading}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <CurrencyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currency={editCurrency}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) =>
          !open && !deleteCurrency.isPending && setDeleteTarget(null)
        }
        title="Delete Currency"
        description={`Are you sure you want to delete currency "${deleteTarget?.code}"? This action cannot be undone.`}
        isPending={deleteCurrency.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCurrency.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Currency deleted successfully");
              setDeleteTarget(null);
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      />
    </DisplayTemplate>
  );
}
