"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { toast } from "sonner";
import {
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
} from "@/hooks/use-purchase-order";
import type { PurchaseOrder, CreatePoDto } from "@/types/purchase-order";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { PoGeneralFields } from "./po-general-fields";
import { PoItemFields } from "./po-item-fields";
import {
  poSchema,
  type PoFormValues,
  getDefaultValues,
  mapItemToPayload,
} from "./po-form-schema";

interface PoFormProps {
  readonly purchaseOrder?: PurchaseOrder;
}

export function PoForm({ purchaseOrder }: PoFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(purchaseOrder ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createPo = useCreatePurchaseOrder();
  const updatePo = useUpdatePurchaseOrder();
  const deletePo = useDeletePurchaseOrder();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createPo.isPending || updatePo.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(purchaseOrder);

  const form = useForm<PoFormValues>({
    resolver: zodResolver(poSchema) as Resolver<PoFormValues>,
    defaultValues,
  });

  const onSubmit = (values: PoFormValues) => {
    const newItems = values.items.filter((item) => !item.id);
    const existingItems = values.items.filter(
      (item): item is typeof item & { id: string } => !!item.id,
    );

    const currentIds = new Set(existingItems.map((item) => item.id));
    const removedItems = defaultValues.items
      .filter(
        (item): item is typeof item & { id: string } =>
          !!item.id && !currentIds.has(item.id),
      )
      .map((item) => ({ id: item.id }));

    const updatedItems = existingItems.filter((item) => {
      const original = defaultValues.items.find((d) => d.id === item.id);
      if (!original) return false;
      return JSON.stringify(item) !== JSON.stringify(original);
    });

    const details: CreatePoDto["details"] = {};
    if (newItems.length > 0) {
      details.add = newItems.map((item, i) => mapItemToPayload(item, i));
    }
    if (updatedItems.length > 0) {
      details.update = updatedItems.map((item, i) => ({
        id: item.id,
        ...mapItemToPayload(item, i),
      }));
    }
    if (removedItems.length > 0) {
      details.remove = removedItems;
    }

    const payload: CreatePoDto = {
      vendor_id: values.vendor_id,
      vendor_name: values.vendor_name,
      delivery_date: values.delivery_date,
      currency_id: values.currency_id,
      currency_name: values.currency_name,
      exchange_rate: values.exchange_rate,
      description: values.description,
      order_date: values.order_date,
      credit_term_id: values.credit_term_id,
      credit_term_name: values.credit_term_name,
      credit_term_value: values.credit_term_value,
      buyer_id: values.buyer_id,
      buyer_name: values.buyer_name,
      email: values.email,
      remarks: values.remarks,
      note: values.note,
      details,
    };

    if (isEdit && purchaseOrder) {
      updatePo.mutate(
        { id: purchaseOrder.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Purchase order updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createPo.mutate(payload, {
        onSuccess: () => {
          toast.success("Purchase order created successfully");
          router.push("/procurement/purchase-order");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && purchaseOrder) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/procurement/purchase-order");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Purchase Order"
        mode={mode}
        formId="po-form"
        isPending={isPending}
        onBack={() => router.push("/procurement/purchase-order")}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={purchaseOrder ? () => setShowDelete(true) : undefined}
        deleteIsPending={deletePo.isPending}
      />

      <form
        id="po-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <PoGeneralFields form={form} disabled={isDisabled} />
        <PoItemFields form={form} disabled={isDisabled} />
      </form>

      {purchaseOrder && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deletePo.isPending && setShowDelete(false)
          }
          title="Delete Purchase Order"
          description={`Are you sure you want to delete purchase order "${purchaseOrder.po_no}"? This action cannot be undone.`}
          isPending={deletePo.isPending}
          onConfirm={() => {
            deletePo.mutate(purchaseOrder.id, {
              onSuccess: () => {
                toast.success("Purchase order deleted successfully");
                router.push("/procurement/purchase-order");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
