"use client";

import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormToolbar } from "@/components/ui/form-toolbar";
import {
  useCreateSpotCheck,
  useUpdateSpotCheck,
  useDeleteSpotCheck,
} from "@/hooks/use-spot-check";
import type { SpotCheck, CreateSpotCheckDto } from "@/types/spot-check";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScGeneralFields } from "./sc-general-fields";
import { ScItemTable } from "./sc-item-table";
import {
  spotCheckSchema,
  type SpotCheckFormValues,
  getDefaultValues,
} from "./sc-form-schema";

interface ScFormProps {
  readonly spotCheck?: SpotCheck;
}

export function ScForm({ spotCheck }: ScFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(spotCheck ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createSc = useCreateSpotCheck();
  const updateSc = useUpdateSpotCheck();
  const deleteSc = useDeleteSpotCheck();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createSc.isPending || updateSc.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(spotCheck);

  const form = useForm<SpotCheckFormValues>({
    resolver: zodResolver(spotCheckSchema) as Resolver<SpotCheckFormValues>,
    defaultValues,
  });

  const method = useWatch({ control: form.control, name: "method" });

  const onSubmit = (values: SpotCheckFormValues) => {
    let payload: CreateSpotCheckDto;

    if (values.method === "random") {
      payload = {
        location_id: values.location_id,
        method: "random",
        product_count: values.product_count,
        description: values.description || undefined,
        note: values.note || undefined,
      };
    } else {
      payload = {
        location_id: values.location_id,
        method: "manual",
        products: values.products.map((p) => ({
          product_id: p.product_id,
        })),
        description: values.description || undefined,
      };
    }

    if (isEdit && spotCheck) {
      updateSc.mutate(
        { id: spotCheck.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Spot check updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createSc.mutate(payload, {
        onSuccess: () => {
          toast.success("Spot check created successfully");
          router.push("/inventory-management/spot-check");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && spotCheck) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/inventory-management/spot-check");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Spot Check"
        mode={mode}
        formId="sc-form"
        isPending={isPending}
        onBack={() => router.push("/inventory-management/spot-check")}
        onCancel={handleCancel}
        onEdit={() => setMode("edit")}
        onDelete={spotCheck ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteSc.isPending}
      />

      <form
        id="sc-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <ScGeneralFields form={form} disabled={isDisabled} />

        {method === "manual" && (
          <div className="max-w-2xl">
            <ScItemTable form={form} disabled={isDisabled} />
          </div>
        )}
      </form>

      {spotCheck && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteSc.isPending && setShowDelete(false)
          }
          title="Delete Spot Check"
          description="Are you sure you want to delete this spot check? This action cannot be undone."
          isPending={deleteSc.isPending}
          onConfirm={() => {
            deleteSc.mutate(spotCheck.id, {
              onSuccess: () => {
                toast.success("Spot check deleted successfully");
                router.push("/inventory-management/spot-check");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
