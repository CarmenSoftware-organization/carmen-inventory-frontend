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
import type { PrFormValues } from "./purchase-request-form";
import { usePrItemTable } from "./use-pr-item-table";
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
}

export function PrItemFields({ form, disabled }: PrItemFieldsProps) {
  const { buCode } = useProfile();
  const [isAllocating, setIsAllocating] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const handleAddItem = () => {
    appendItem({ ...PR_ITEM });
  };

  const table = usePrItemTable({
    form,
    itemFields,
    disabled,
    onDelete: setDeleteIndex,
  });

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
          form.setValue(`items.${index}.unit_price`, selected.price);
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
          {table.getSelectedRowModel().rows.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="success" size="xs">
                <Check />
                Approve
              </Button>
              <Button type="button" variant="info" size="xs">
                <Eye />
                Review
              </Button>
              <Button type="button" variant="destructive" size="xs">
                <X />
                Reject
              </Button>
              <Button type="button" variant="warning" size="xs">
                <Scissors />
                Split
              </Button>
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
              <Button type="button" size="xs" onClick={() => handleAddItem()}>
                <Plus /> Add Item
              </Button>
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
    </div>
  );
}
