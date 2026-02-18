"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { useProfile } from "@/hooks/use-profile";
import {
  useExchangeRateQuery,
  useExchangeRateMutation,
  useExternalExchangeRates,
} from "@/hooks/use-exchange-rate";
import { useDataGridState } from "@/hooks/use-data-grid-state";
import { ErrorState } from "@/components/ui/error-state";
import DisplayTemplate from "@/components/display-template";
import type { ExchangeRateItem, CurrencyWithDiff } from "@/types/exchange-rate";
import { ExchangeRateDialog } from "./exchange-rate-dialog";
import { useExchangeRateTable } from "./use-exchange-rate-table";

export default function ExchangeRateComponent() {
  const { defaultCurrencyCode } = useProfile();
  const baseCurrency = defaultCurrencyCode ?? "THB";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExchangeRateItem | null>(null);

  const { params, tableConfig } = useDataGridState();
  const queryParams = useMemo(
    () => ({ ...params, sort: "at_date:desc" }),
    [params],
  );
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useExchangeRateQuery(queryParams);

  const items = historyData?.data ?? [];
  const totalRecords = historyData?.paginate?.total ?? 0;

  // --- Currencies (internal) ---
  const { data: currencyData, isLoading: isLoadingCurrencies } = useCurrency({
    perpage: -1,
  });

  const { data: externalRates, isRefetching } =
    useExternalExchangeRates(baseCurrency);

  // --- Currency diff ---
  const currencyWithDiff: CurrencyWithDiff[] = useMemo(() => {
    const currencies = currencyData?.data;
    if (!currencies || !externalRates) return [];

    return currencies
      .filter((c) => c.code !== baseCurrency)
      .map((c) => {
        const oldRate = c.exchange_rate;
        const newRate = externalRates[c.code] ?? oldRate;
        const diff = newRate - oldRate;
        const diffPercent = oldRate === 0 ? 0 : (diff / oldRate) * 100;
        return {
          id: c.id,
          code: c.code,
          oldRate,
          newRate,
          diff,
          diffPercent,
        };
      });
  }, [currencyData, externalRates, baseCurrency]);

  const bulkMutation = useExchangeRateMutation();

  const handleBulkUpdate = () => {
    const payload = currencyWithDiff.map((item) => ({
      currency_id: item.id,
      at_date: new Date().toISOString(),
      exchange_rate: item.newRate,
    }));

    bulkMutation.mutate(payload, {
      onSuccess: () => toast.success("Exchange rates updated successfully"),
      onError: (err) => toast.error(err.message),
    });
  };

  const table = useExchangeRateTable({
    items,
    totalRecords,
    params,
    tableConfig,
    onEdit: (item) => {
      setEditItem(item);
      setDialogOpen(true);
    },
  });

  if (historyError) {
    return (
      <ErrorState
        message={historyError.message}
        onRetry={() => refetchHistory()}
      />
    );
  }

  return (
    <DisplayTemplate
      title="Exchange Rate"
      description={`Manage exchange rates (base: ${baseCurrency})`}
      actions={
        <Button
          size="sm"
          onClick={handleBulkUpdate}
          disabled={
            isLoadingCurrencies ||
            isRefetching ||
            bulkMutation.isPending ||
            currencyWithDiff.length === 0
          }
        >
          <RefreshCw
            className={
              isRefetching || bulkMutation.isPending ? "animate-spin" : ""
            }
          />
          {bulkMutation.isPending ? "Updating..." : "Update Exchange Rates"}
        </Button>
      }
    >
      <DataGrid
        table={table}
        recordCount={totalRecords}
        isLoading={isLoadingHistory}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination sizes={[5, 10, 25, 50, 100]} />
      </DataGrid>

      <ExchangeRateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editItem}
      />
    </DisplayTemplate>
  );
}
