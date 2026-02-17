"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCreatePhysicalCount,
  useUpdatePhysicalCount,
  useDeletePhysicalCount,
} from "@/hooks/use-physical-count";
import type { PhysicalCount, CreatePhysicalCountDto } from "@/types/physical-count";
import { type FormMode, getModeLabels } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { PcGeneralFields } from "./pc-general-fields";
import {
  physicalCountSchema,
  type PhysicalCountFormValues,
  getDefaultValues,
} from "./pc-form-schema";

interface PcFormProps {
  readonly physicalCount?: PhysicalCount;
}

export function PcForm({ physicalCount }: PcFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(physicalCount ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createPc = useCreatePhysicalCount();
  const updatePc = useUpdatePhysicalCount();
  const deletePc = useDeletePhysicalCount();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createPc.isPending || updatePc.isPending;
  const isDisabled = isView || isPending;
  const labels = getModeLabels(mode, "Physical Count");

  const defaultValues = getDefaultValues(physicalCount);

  const form = useForm<PhysicalCountFormValues>({
    resolver: zodResolver(physicalCountSchema) as Resolver<PhysicalCountFormValues>,
    defaultValues,
  });

  const onSubmit = (values: PhysicalCountFormValues) => {
    const payload: CreatePhysicalCountDto = {
      department_id: values.department_id,
    };

    if (isEdit && physicalCount) {
      updatePc.mutate(
        { id: physicalCount.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Physical count updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createPc.mutate(payload, {
        onSuccess: () => {
          toast.success("Physical count created successfully");
          router.push("/inventory-management/physical-count");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && physicalCount) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/inventory-management/physical-count");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/inventory-management/physical-count")}
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
                form="pc-form"
                disabled={isPending}
              >
                {isPending ? labels.pending : labels.submit}
              </Button>
            </>
          )}
          {isEdit && physicalCount && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deletePc.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="pc-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <PcGeneralFields form={form} disabled={isDisabled} />
      </form>

      {physicalCount && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deletePc.isPending && setShowDelete(false)
          }
          title="Delete Physical Count"
          description={`Are you sure you want to delete this physical count? This action cannot be undone.`}
          isPending={deletePc.isPending}
          onConfirm={() => {
            deletePc.mutate(physicalCount.id, {
              onSuccess: () => {
                toast.success("Physical count deleted successfully");
                router.push("/inventory-management/physical-count");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}
