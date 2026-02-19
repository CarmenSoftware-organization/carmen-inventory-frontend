"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { toast } from "sonner";
import {
  useCreatePrt,
  useUpdatePrt,
  useDeletePrt,
  type CreatePrtDto,
} from "@/hooks/use-prt";
import type { PurchaseRequestTemplate } from "@/types/purchase-request";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { PrtGeneralFields } from "./prt-general-fields";
import { PrtItemFields } from "./prt-item-fields";
import {
  prtSchema,
  type PrtFormValues,
  getDefaultValues,
  mapItemToPayload,
} from "./prt-form-schema";
import { useProfile } from "@/hooks/use-profile";

interface PrtFormProps {
  readonly template?: PurchaseRequestTemplate;
}

export function PrtForm({ template }: PrtFormProps) {
  const { defaultBu } = useProfile();
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(template ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createPrt = useCreatePrt();
  const updatePrt = useUpdatePrt();
  const deletePrt = useDeletePrt();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createPrt.isPending || updatePrt.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(template);

  const form = useForm<PrtFormValues>({
    resolver: zodResolver(prtSchema) as Resolver<PrtFormValues>,
    defaultValues,
  });

  const onSubmit = (values: PrtFormValues) => {
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
      const idx = values.items.findIndex((v) => v.id === item.id);
      const dirty = form.formState.dirtyFields.items?.[idx];
      return dirty != null && Object.keys(dirty).length > 0;
    });

    const purchase_request_template_detail: CreatePrtDto["purchase_request_template_detail"] =
      {};
    if (newItems.length > 0) {
      purchase_request_template_detail.add = newItems.map(mapItemToPayload);
    }
    if (updatedItems.length > 0) {
      purchase_request_template_detail.update = updatedItems.map((item) => ({
        id: item.id,
        ...mapItemToPayload(item),
      }));
    }
    if (removedItems.length > 0) {
      purchase_request_template_detail.remove = removedItems;
    }

    const payload: CreatePrtDto = {
      name: values.name,
      description: values.description,
      workflow_id: values.workflow_id,
      department_id: values.department_id,
      is_active: values.is_active,
      note: values.note,
      purchase_request_template_detail,
    };

    if (isEdit && template) {
      updatePrt.mutate(
        { id: template.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Template updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createPrt.mutate(payload, {
        onSuccess: () => {
          toast.success("Template created successfully");
          router.push("/procurement/purchase-request-template");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && template) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/procurement/purchase-request-template");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Purchase Request Template"
        mode={mode}
        formId="prt-form"
        isPending={isPending}
        onBack={() => router.push("/procurement/purchase-request-template")}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={template ? () => setShowDelete(true) : undefined}
        deleteIsPending={deletePrt.isPending}
      />

      <form
        id="prt-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <PrtGeneralFields form={form} disabled={isDisabled} />
        <PrtItemFields
          form={form}
          disabled={isDisabled}
          defaultBu={defaultBu}
        />
      </form>

      {template && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deletePrt.isPending && setShowDelete(false)
          }
          title="Delete Template"
          description={`Are you sure you want to delete template "${template.name}"? This action cannot be undone.`}
          isPending={deletePrt.isPending}
          onConfirm={() => {
            deletePrt.mutate(template.id, {
              onSuccess: () => {
                toast.success("Template deleted successfully");
                router.push("/procurement/purchase-request-template");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
