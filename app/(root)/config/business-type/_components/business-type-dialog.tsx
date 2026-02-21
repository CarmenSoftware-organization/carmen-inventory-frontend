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
  useCreateBusinessType,
  useUpdateBusinessType,
} from "@/hooks/use-business-type";
import type { BusinessType } from "@/types/business-type";
import { getModeLabels } from "@/types/form";

const businessTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean(),
});

type BusinessTypeFormValues = z.infer<typeof businessTypeSchema>;

interface BusinessTypeDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly businessType?: BusinessType | null;
}

export function BusinessTypeDialog({
  open,
  onOpenChange,
  businessType,
}: BusinessTypeDialogProps) {
  const isEdit = !!businessType;
  const createBusinessType = useCreateBusinessType();
  const updateBusinessType = useUpdateBusinessType();
  const isPending =
    createBusinessType.isPending || updateBusinessType.isPending;
  const labels = getModeLabels(isEdit ? "edit" : "add", "Business Type");

  const form = useForm<BusinessTypeFormValues>({
    resolver: zodResolver(businessTypeSchema) as Resolver<BusinessTypeFormValues>,
    defaultValues: { name: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        businessType
          ? { name: businessType.name, is_active: businessType.is_active }
          : { name: "", is_active: true },
      );
    }
  }, [open, businessType, form]);

  const onSubmit = (values: BusinessTypeFormValues) => {
    const payload = {
      name: values.name,
      is_active: values.is_active,
    };

    if (isEdit) {
      updateBusinessType.mutate(
        { id: businessType.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Business type updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createBusinessType.mutate(payload, {
        onSuccess: () => {
          toast.success("Business type created successfully");
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
              <FieldLabel htmlFor="business-type-name" className="text-xs">
                Name
              </FieldLabel>
              <Input
                id="business-type-name"
                placeholder="e.g. Manufacturer, Distributor"
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
                    id="business-type-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FieldLabel htmlFor="business-type-is-active" className="text-xs">
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
