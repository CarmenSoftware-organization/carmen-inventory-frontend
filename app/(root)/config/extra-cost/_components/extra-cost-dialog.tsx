"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
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
import { toast } from "sonner";
import {
  useCreateExtraCost,
  useUpdateExtraCost,
} from "@/hooks/use-extra-cost";
import type { ExtraCost } from "@/types/extra-cost";
import { getModeLabels } from "@/types/form";

const extraCostSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean(),
});

type ExtraCostFormValues = z.infer<typeof extraCostSchema>;

interface ExtraCostDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly extraCost?: ExtraCost | null;
}

export function ExtraCostDialog({
  open,
  onOpenChange,
  extraCost,
}: ExtraCostDialogProps) {
  const isEdit = !!extraCost;
  const createExtraCost = useCreateExtraCost();
  const updateExtraCost = useUpdateExtraCost();
  const isPending = createExtraCost.isPending || updateExtraCost.isPending;
  const labels = getModeLabels(isEdit ? "edit" : "add", "Extra Cost");

  const form = useForm<ExtraCostFormValues>({
    resolver: zodResolver(extraCostSchema) as Resolver<ExtraCostFormValues>,
    defaultValues: { name: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        extraCost
          ? { name: extraCost.name, is_active: extraCost.is_active }
          : { name: "", is_active: true },
      );
    }
  }, [open, extraCost, form]);

  const onSubmit = (values: ExtraCostFormValues) => {
    const payload = {
      name: values.name,
      is_active: values.is_active,
    };

    if (isEdit) {
      updateExtraCost.mutate(
        { id: extraCost.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Extra cost updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createExtraCost.mutate(payload, {
        onSuccess: () => {
          toast.success("Extra cost created successfully");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-3 p-4">
        <DialogHeader className="gap-0 pb-1">
          <DialogTitle className="text-sm">
            {labels.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FieldGroup className="gap-3">
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="extra-cost-name" className="text-xs">
                Name
              </FieldLabel>
              <Input
                id="extra-cost-name"
                placeholder="e.g. Shipping, Insurance"
                className="h-8 text-sm"
                disabled={isPending}
                maxLength={100}
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field orientation="horizontal">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox
                    id="extra-cost-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FieldLabel htmlFor="extra-cost-is-active" className="text-xs">
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
              {isPending ? labels.pending : labels.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
