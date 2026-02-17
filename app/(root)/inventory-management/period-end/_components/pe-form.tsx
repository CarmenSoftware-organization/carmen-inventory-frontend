"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCreatePeriodEnd,
  useUpdatePeriodEnd,
  useDeletePeriodEnd,
} from "@/hooks/use-period-end";
import type { PeriodEnd, CreatePeriodEndDto } from "@/types/period-end";
import { type FormMode, getModeLabels } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { PeGeneralFields } from "./pe-general-fields";
import {
  periodEndSchema,
  type PeriodEndFormValues,
  getDefaultValues,
} from "./pe-form-schema";

interface PeFormProps {
  readonly periodEnd?: PeriodEnd;
}

export function PeForm({ periodEnd }: PeFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(periodEnd ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createPe = useCreatePeriodEnd();
  const updatePe = useUpdatePeriodEnd();
  const deletePe = useDeletePeriodEnd();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createPe.isPending || updatePe.isPending;
  const isDisabled = isView || isPending;
  const labels = getModeLabels(mode, "Period End");

  const defaultValues = getDefaultValues(periodEnd);

  const form = useForm<PeriodEndFormValues>({
    resolver: zodResolver(periodEndSchema) as Resolver<PeriodEndFormValues>,
    defaultValues,
  });

  const onSubmit = (values: PeriodEndFormValues) => {
    const payload: CreatePeriodEndDto = {
      pe_no: values.pe_no,
    };

    if (isEdit && periodEnd) {
      updatePe.mutate(
        { id: periodEnd.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Period end updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createPe.mutate(payload, {
        onSuccess: () => {
          toast.success("Period end created successfully");
          router.push("/inventory-management/period-end");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && periodEnd) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/inventory-management/period-end");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/inventory-management/period-end")}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">{labels.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isView ? (
            <Button size="sm" onClick={() => setMode("edit")}>
              <Pencil />
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                form="pe-form"
                disabled={isPending}
              >
                {isPending ? labels.pending : labels.submit}
              </Button>
            </>
          )}
          {isEdit && periodEnd && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deletePe.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="pe-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <PeGeneralFields form={form} disabled={isDisabled} />
      </form>

      {periodEnd && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deletePe.isPending && setShowDelete(false)
          }
          title="Delete Period End"
          description={`Are you sure you want to delete period end "${periodEnd.pe_no}"? This action cannot be undone.`}
          isPending={deletePe.isPending}
          onConfirm={() => {
            deletePe.mutate(periodEnd.id, {
              onSuccess: () => {
                toast.success("Period end deleted successfully");
                router.push("/inventory-management/period-end");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
