"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { toast } from "sonner";
import {
  useCreateCreditNote,
  useUpdateCreditNote,
  useDeleteCreditNote,
} from "@/hooks/use-credit-note";
import type { CreditNote, CreateCnDto } from "@/types/credit-note";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { CnGeneralFields } from "./cn-general-fields";
import { CnItemFields } from "./cn-item-fields";
import {
  cnSchema,
  type CnFormValues,
  getDefaultValues,
  mapItemToPayload,
} from "./cn-form-schema";
import { useProfile } from "@/hooks/use-profile";

interface CnFormProps {
  readonly creditNote?: CreditNote;
}

export function CnForm({ creditNote }: CnFormProps) {
  const { defaultCurrencyId } = useProfile();
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(creditNote ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createCn = useCreateCreditNote();
  const updateCn = useUpdateCreditNote();
  const deleteCn = useDeleteCreditNote();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createCn.isPending || updateCn.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(creditNote, { defaultCurrencyId });

  const form = useForm<CnFormValues>({
    resolver: zodResolver(cnSchema) as Resolver<CnFormValues>,
    defaultValues,
  });

  const onSubmit = (values: CnFormValues) => {
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

    const items: CreateCnDto["items"] = {};
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

    const payload: CreateCnDto = {
      credit_note_type: values.credit_note_type,
      grn_id: values.grn_id,
      vendor_id: values.vendor_id,
      credit_note_number: values.credit_note_number,
      credit_note_date: values.credit_note_date,
      reference_number: values.reference_number,
      description: values.description,
      currency_code: values.currency_code,
      exchange_rate: values.exchange_rate,
      tax_amount: values.tax_amount,
      discount_amount: values.discount_amount,
      notes: values.notes,
      items,
    };

    if (isEdit && creditNote) {
      updateCn.mutate(
        { id: creditNote.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Credit note updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createCn.mutate(payload, {
        onSuccess: () => {
          toast.success("Credit note created successfully");
          router.push("/procurement/credit-note");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && creditNote) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/procurement/credit-note");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Credit Note"
        mode={mode}
        formId="cn-form"
        isPending={isPending}
        onBack={() => router.push("/procurement/credit-note")}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={creditNote ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteCn.isPending}
      />

      <form
        id="cn-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <CnGeneralFields form={form} disabled={isDisabled} />
        <CnItemFields form={form} disabled={isDisabled} />
      </form>

      {creditNote && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteCn.isPending && setShowDelete(false)
          }
          title="Delete Credit Note"
          description={`Are you sure you want to delete credit note "${creditNote.credit_note_number}"? This action cannot be undone.`}
          isPending={deleteCn.isPending}
          onConfirm={() => {
            deleteCn.mutate(creditNote.id, {
              onSuccess: () => {
                toast.success("Credit note deleted successfully");
                router.push("/procurement/credit-note");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
