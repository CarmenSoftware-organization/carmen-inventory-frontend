"use no memo";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
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
} from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { useProfile } from "@/hooks/use-profile";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { STAGE_ROLE } from "@/types/stage-role";
import type { PrFormValues } from "./purchase-request-form";
import { usePrItemTable } from "./use-pr-item-table";
import { PrActionDialog } from "./pr-action-dialog";
import EmptyComponent from "@/components/empty-component";
import { PR_ITEM } from "./pr-item.defaults";

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
  disabled: boolean;
  role?: string;
  prId?: string;
  prStatus?: string;
  onSplit?: (detailIds: string[]) => void;
}

export function PrItemFields({
  form,
  disabled,
  role,
  prId,
  prStatus,
  onSplit,
}: PrItemFieldsProps) {
  const { buCode, defaultBu } = useProfile();
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
      currency_id: defaultBu?.config.default_currency_id ?? "",
      delivery_date: tomorrow.toISOString(),
    });
  };

  const table = usePrItemTable({
    form,
    itemFields,
    disabled,
    prStatus,
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

    try {
      await Promise.all(
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

          if (!res.ok) return;

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

      if (allocated > 0) {
        toast.success(`Allocated ${allocated} of ${items.length} items`);
      } else {
        toast.warning("No price list found for the items");
      }
    } catch {
      toast.error("Failed to auto allocate");
    } finally {
      setIsAllocating(false);
    }
  };

  // --- Bulk Action Handlers ---

  const getSelectedIndices = (): number[] => {
    return selectedRows.map((row) => row.index);
  };

  const handleBulkApprove = () => {
    const indices = getSelectedIndices();
    indices.forEach((index) => {
      form.setValue(`items.${index}.stage_status`, "approved");
    });
    table.resetRowSelection();
    toast.success(`${indices.length} item(s) marked as approved`);
  };

  const handleBulkActionConfirm = (message: string) => {
    if (!bulkAction) return;
    const indices = getSelectedIndices();
    indices.forEach((index) => {
      form.setValue(`items.${index}.stage_status`, bulkAction);
      form.setValue(`items.${index}.stage_message`, message);
    });
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
            {!disabled && (
              <Button type="button" size="xs" onClick={() => handleAddItem()}>
                <Plus /> Add Item
              </Button>
            )}
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
                  variant="warning"
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
              !disabled && (
                <Button type="button" size="xs" onClick={() => handleAddItem()}>
                  <Plus /> Add Item
                </Button>
              )
            }
          />
        }
      >
        <DataGridContainer>
          <ScrollArea className="w-full">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
      </DataGrid>

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
    </div>
  );
}
