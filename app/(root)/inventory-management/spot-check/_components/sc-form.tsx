"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCreateSpotCheck,
  useUpdateSpotCheck,
  useDeleteSpotCheck,
} from "@/hooks/use-spot-check";
import type { SpotCheck, CreateSpotCheckDto } from "@/types/spot-check";
import { type FormMode, getModeLabels } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScGeneralFields } from "./sc-general-fields";
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
  const labels = getModeLabels(mode, "Spot Check");

  const defaultValues = getDefaultValues(spotCheck);

  const form = useForm<SpotCheckFormValues>({
    resolver: zodResolver(spotCheckSchema) as Resolver<SpotCheckFormValues>,
    defaultValues,
  });

  const onSubmit = (values: SpotCheckFormValues) => {
    const payload: CreateSpotCheckDto = {
      department_id: values.department_id,
    };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/inventory-management/spot-check")}
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
                form="sc-form"
                disabled={isPending}
              >
                {isPending ? labels.pending : labels.submit}
              </Button>
            </>
          )}
          {isEdit && spotCheck && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteSc.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="sc-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <ScGeneralFields form={form} disabled={isDisabled} />
      </form>

      {spotCheck && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteSc.isPending && setShowDelete(false)
          }
          title="Delete Spot Check"
          description={`Are you sure you want to delete this spot check? This action cannot be undone.`}
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
