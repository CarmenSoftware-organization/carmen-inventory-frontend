"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { toast } from "sonner";
import {
  useCreateGoodsReceiveNote,
  useUpdateGoodsReceiveNote,
  useDeleteGoodsReceiveNote,
} from "@/hooks/use-goods-receive-note";
import type { GoodsReceiveNote, CreateGrnDto } from "@/types/goods-receive-note";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { GrnGeneralFields } from "./grn-general-fields";
import { GrnItemFields } from "./grn-item-fields";
import {
  grnSchema,
  type GrnFormValues,
  getDefaultValues,
  mapItemToPayload,
} from "./grn-form-schema";

interface GrnFormProps {
  readonly goodsReceiveNote?: GoodsReceiveNote;
}

export function GrnForm({ goodsReceiveNote }: GrnFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(goodsReceiveNote ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createGrn = useCreateGoodsReceiveNote();
  const updateGrn = useUpdateGoodsReceiveNote();
  const deleteGrn = useDeleteGoodsReceiveNote();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createGrn.isPending || updateGrn.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(goodsReceiveNote);

  const form = useForm<GrnFormValues>({
    resolver: zodResolver(grnSchema) as Resolver<GrnFormValues>,
    defaultValues,
  });

  const onSubmit = (values: GrnFormValues) => {
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

    const items: CreateGrnDto["items"] = {};
    if (newItems.length > 0) {
      items.add = newItems.map((item) => mapItemToPayload(item));
    }
    if (updatedItems.length > 0) {
      items.update = updatedItems.map((item) => ({
        id: item.id,
        ...mapItemToPayload(item),
      }));
    }
    if (removedItems.length > 0) {
      items.remove = removedItems;
    }

    const payload: CreateGrnDto = {
      grn_number: values.grn_number,
      grn_date: values.grn_date,
      vendor_id: values.vendor_id,
      po_id: values.po_id || undefined,
      description: values.description || undefined,
      items,
    };

    if (isEdit && goodsReceiveNote) {
      updateGrn.mutate(
        { id: goodsReceiveNote.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Goods receive note updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createGrn.mutate(payload, {
        onSuccess: () => {
          toast.success("Goods receive note created successfully");
          router.push("/procurement/goods-receive-note");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && goodsReceiveNote) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/procurement/goods-receive-note");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Goods Receive Note"
        mode={mode}
        formId="grn-form"
        isPending={isPending}
        onBack={() => router.push("/procurement/goods-receive-note")}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={goodsReceiveNote ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteGrn.isPending}
      />

      <form
        id="grn-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <GrnGeneralFields form={form} disabled={isDisabled} />
        <GrnItemFields form={form} disabled={isDisabled} />
      </form>

      {goodsReceiveNote && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteGrn.isPending && setShowDelete(false)
          }
          title="Delete Goods Receive Note"
          description={`Are you sure you want to delete goods receive note "${goodsReceiveNote.grn_number}"? This action cannot be undone.`}
          isPending={deleteGrn.isPending}
          onConfirm={() => {
            deleteGrn.mutate(goodsReceiveNote.id, {
              onSuccess: () => {
                toast.success("Goods receive note deleted successfully");
                router.push("/procurement/goods-receive-note");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
