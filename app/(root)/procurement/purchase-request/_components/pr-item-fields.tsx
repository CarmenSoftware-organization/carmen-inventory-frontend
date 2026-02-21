// Opt out of React Compiler memoization — useFieldArray + dynamic setValue calls
// cause stale closure issues when auto-memoized.
"use no memo";

import { useState } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import {
  BoxIcon,
  Check,
  Eye,
  Loader2,
  Plus,
  RefreshCcw,
  Scissors,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { STAGE_ROLE } from "@/types/stage-role";
import type { BusinessUnit } from "@/types/profile";
import type { PrFormValues } from "./pr-form-schema";
import { usePrItemTable } from "./pr-item-table";
import { PrActionDialog } from "./pr-action-dialog";
import dynamic from "next/dynamic";

const PrSelectDialog = dynamic(
  () => import("./pr-select-dialog").then((mod) => mod.PrSelectDialog),
);
import EmptyComponent from "@/components/empty-component";
import { PR_ITEM } from "./pr-form-schema";

function getDeleteDescription(
  index: number | null,
  form: UseFormReturn<PrFormValues>,
) {
  if (index === null) return "";
  const name = form.getValues(`items.${index}.product_name`);
  const label = name || `Item #${index + 1}`;
  return `Are you sure you want to remove "${label}"?`;
}

interface PrItemFieldsProps {
  form: UseFormReturn<PrFormValues>;
  isDisabled: boolean;
  role?: string;
  prId?: string;
  prStatus?: string;
  buCode?: string;
  defaultBu?: BusinessUnit;
  dateFormat: string;
  onSplit?: (detailIds: string[]) => void;
}

export function PrItemFields({
  form,
  isDisabled,
  role,
  prId,
  prStatus,
  buCode,
  defaultBu,
  dateFormat,
  onSplit,
}: PrItemFieldsProps) {
  const [isAllocating, setIsAllocating] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [bulkAction, setBulkAction] = useState<"review" | "rejected" | null>(
    null,
  );

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const handleAddItem = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    appendItem({
      ...PR_ITEM,
      currency_id: defaultBu?.config.default_currency_id ?? null,
      delivery_date: tomorrow.toISOString(),
    });
  };

  const {
    table,
    selectDialogOpen,
    setSelectDialogOpen,
    allCount,
    pendingCount,
    handleSelectAll,
    handleSelectPending,
  } = usePrItemTable({
    form,
    itemFields,
    isDisabled,
    prStatus,
    dateFormat,
    buCode,
    onDelete: setDeleteIndex,
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const canBulkAction =
    role === STAGE_ROLE.APPROVE || role === STAGE_ROLE.PURCHASE;

  const handleAutoAllocate = async () => {
    const items = form.getValues("items");
    if (items.length === 0) return;

    setIsAllocating(true);
    let allocated = 0;

    const results = await Promise.allSettled(
      items.map(async (item, index) => {
        if (!item.product_id || !item.requested_unit_id || !item.currency_id)
          return;

        const url = buildUrl(
          `/api/proxy/api/${buCode}/price-list/price-compare`,
          {
            product_id: item.product_id,
            unit_id: item.requested_unit_id,
            at_date: item.delivery_date,
            currency_id: item.currency_id,
          },
        );

        const res = await httpClient.get(url);
        if (!res.ok) throw new Error("fetch failed");

        const json = await res.json();
        const selected = json.data?.selected;
        if (!selected) return;

        form.setValue(`items.${index}.vendor_id`, selected.vendor_id);
        form.setValue(`items.${index}.vendor_name`, selected.vendor_name);
        form.setValue(`items.${index}.pricelist_price`, selected.price);
        form.setValue(
          `items.${index}.pricelist_detail_id`,
          selected.pricelist_detail_id,
        );
        form.setValue(`items.${index}.pricelist_no`, selected.pricelist_no);
        allocated++;
      }),
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    if (allocated > 0) {
      toast.success(`Allocated ${allocated} of ${items.length} items`);
    }
    if (failed > 0) {
      toast.error(`${failed} item(s) failed to allocate`);
    }
    if (allocated === 0 && failed === 0) {
      toast.warning("No price list found for the items");
    }

    setIsAllocating(false);
  };

  const getSelectedIndices = (): number[] => {
    return selectedRows.map((row) => row.index);
  };

  const handleBulkApprove = () => {
    const indices = getSelectedIndices();
    for (const index of indices) {
      form.setValue(`items.${index}.stage_status`, "approved");
      form.setValue(`items.${index}.current_stage_status`, "approved");
    }
    table.resetRowSelection();
    toast.success(`${indices.length} item(s) marked as approved`);
  };

  const handleBulkActionConfirm = (message: string) => {
    if (!bulkAction) return;
    const indices = getSelectedIndices();
    for (const index of indices) {
      form.setValue(`items.${index}.stage_status`, bulkAction);
      form.setValue(`items.${index}.stage_message`, message);
      form.setValue(`items.${index}.current_stage_status`, bulkAction);
    }
    table.resetRowSelection();
    setBulkAction(null);
    toast.success(`${indices.length} item(s) marked as ${bulkAction}`);
  };

  const handleBulkSplit = () => {
    const detailIds = selectedRows
      .map((row) => {
        const item = form.getValues(`items.${row.index}`);
        return item.id;
      })
      .filter((id): id is string => !!id);

    if (detailIds.length === 0) {
      toast.error("No saved items selected for split");
      return;
    }

    onSplit?.(detailIds);
    table.resetRowSelection();
  };

  const bulkActionDialogConfig = {
    review: {
      title: "Review Selected Items",
      description: "Please provide a reason for sending items for review.",
      confirmLabel: "Send for Review",
      confirmVariant: "default" as const,
    },
    rejected: {
      title: "Reject Selected Items",
      description: "Please provide a reason for rejecting these items.",
      confirmLabel: "Reject",
      confirmVariant: "destructive" as const,
    },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Items</h2>

        <div className="flex flex-col  gap-2">
          <div className="flex items-center justify-end gap-1.5">
            {!isDisabled && role !== STAGE_ROLE.PURCHASE && (
              <Button type="button" size="xs" onClick={() => handleAddItem()}>
                <Plus /> Add Item
              </Button>
            )}

            {role === STAGE_ROLE.PURCHASE && (
              <Button
                type="button"
                size="xs"
                disabled={isAllocating || itemFields.length === 0}
                onClick={handleAutoAllocate}
              >
                {isAllocating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RefreshCcw />
                )}
                Auto Allocate
              </Button>
            )}
          </div>
          {selectedRows.length > 0 && canBulkAction && (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="success"
                size="xs"
                onClick={handleBulkApprove}
              >
                <Check />
                Approve
              </Button>
              <Button
                type="button"
                variant="info"
                size="xs"
                onClick={() => setBulkAction("review")}
              >
                <Eye />
                Review
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="xs"
                onClick={() => setBulkAction("rejected")}
              >
                <X />
                Reject
              </Button>
              {prId && (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleBulkSplit}
                >
                  <Scissors />
                  Split
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <DataGrid
        table={table}
        recordCount={itemFields.length}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-[11px]" }}
        emptyMessage={
          <EmptyComponent
            icon={BoxIcon}
            title="No Products Yet"
            description="You haven't created any Products yet."
            content={
              !isDisabled && (
                <Button type="button" size="xs" onClick={() => handleAddItem()}>
                  <Plus /> Add Item
                </Button>
              )
            }
          />
        }
      >
        <DataGridContainer>
          <ScrollArea className="w-full pb-4">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
      </DataGrid>

      {itemFields.length > 0 && (
        <GrandTotal control={form.control} itemCount={itemFields.length} />
      )}

      <DeleteDialog
        open={deleteIndex !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteIndex(null);
        }}
        title="Remove Item"
        description={getDeleteDescription(deleteIndex, form)}
        onConfirm={() => {
          if (deleteIndex === null) return;
          removeItem(deleteIndex);
          setDeleteIndex(null);
        }}
      />

      {bulkAction && (
        <PrActionDialog
          open={!!bulkAction}
          onOpenChange={(open) => {
            if (!open) setBulkAction(null);
          }}
          onConfirm={handleBulkActionConfirm}
          {...bulkActionDialogConfig[bulkAction]}
        />
      )}

      <PrSelectDialog
        open={selectDialogOpen}
        onOpenChange={setSelectDialogOpen}
        allCount={allCount}
        pendingCount={pendingCount}
        onSelectAll={handleSelectAll}
        onSelectPending={handleSelectPending}
      />
    </div>
  );
}

function GrandTotal({
  control,
  itemCount,
}: {
  readonly control: UseFormReturn<PrFormValues>["control"];
  readonly itemCount: number;
}) {
  const items = useWatch({ control, name: "items" });

  const grandTotal = items.reduce(
    (sum, item) => sum + Number(item?.total_price ?? 0),
    0,
  );

  return (
    <div className="flex items-center justify-end gap-3 border-t pt-2 text-sm">
      <span className="text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>
      <span className="font-semibold tabular-nums">
        Total:{" "}
        {grandTotal.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}
