"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateUnit, useUpdateUnit } from "@/hooks/use-unit";
import type { Unit } from "@/types/unit";

const unitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  is_active: z.boolean(),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly unit?: Unit | null;
}

export function UnitDialog({ open, onOpenChange, unit }: UnitDialogProps) {
  const isEdit = !!unit;
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const isPending = createUnit.isPending || updateUnit.isPending;

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: "", description: "", is_active: true },
  });

  const onSubmit = (values: UnitFormValues) => {
    const payload = {
      name: values.name,
      description: values.description ?? "",
      is_active: values.is_active,
    };

    if (isEdit) {
      updateUnit.mutate(
        { id: unit.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Unit updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createUnit.mutate(payload, {
        onSuccess: () => {
          toast.success("Unit created successfully");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const getButtonLabel = () => {
    if (isPending) {
      return isEdit ? "Saving..." : "Creating...";
    }
    return isEdit ? "Save" : "Create";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm gap-3 p-4"
        onOpenAutoFocus={() =>
          form.reset(
            unit
              ? {
                  name: unit.name,
                  description: unit.description,
                  is_active: unit.is_active,
                }
              : { name: "", description: "", is_active: true },
          )
        }
      >
        <DialogHeader className="gap-0 pb-1">
          <DialogTitle className="text-sm">
            {isEdit ? "Edit Unit" : "Add Unit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FieldGroup className="gap-3">
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="unit-name" className="text-xs">
                Name
              </FieldLabel>
              <Input
                id="unit-name"
                placeholder="e.g. TRAY"
                className="h-8 text-sm"
                disabled={isPending}
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="unit-description" className="text-xs">
                Description
              </FieldLabel>
              <Textarea
                id="unit-description"
                placeholder="Optional"
                className="h-8 text-sm"
                disabled={isPending}
                {...form.register("description")}
              />
            </Field>

            <Field orientation="horizontal">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox
                    id="unit-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FieldLabel htmlFor="unit-is-active" className="text-xs">
                Active
              </FieldLabel>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {getButtonLabel()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
