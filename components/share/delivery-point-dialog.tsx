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
  useCreateDeliveryPoint,
  useUpdateDeliveryPoint,
} from "@/hooks/use-delivery-point";
import type { DeliveryPoint } from "@/types/delivery-point";
import { getModeLabels } from "@/types/form";

const deliveryPointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean(),
});

type DeliveryPointFormValues = z.infer<typeof deliveryPointSchema>;

interface DeliveryPointDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly deliveryPoint?: DeliveryPoint | null;
}

export function DeliveryPointDialog({
  open,
  onOpenChange,
  deliveryPoint,
}: DeliveryPointDialogProps) {
  const isEdit = !!deliveryPoint;
  const createDeliveryPoint = useCreateDeliveryPoint();
  const updateDeliveryPoint = useUpdateDeliveryPoint();
  const isPending =
    createDeliveryPoint.isPending || updateDeliveryPoint.isPending;
  const labels = getModeLabels(isEdit ? "edit" : "add", "Delivery Point");

  const form = useForm<DeliveryPointFormValues>({
    resolver: zodResolver(deliveryPointSchema) as Resolver<DeliveryPointFormValues>,
    defaultValues: { name: "", is_active: true },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        deliveryPoint
          ? { name: deliveryPoint.name, is_active: deliveryPoint.is_active }
          : { name: "", is_active: true },
      );
    }
  }, [open, deliveryPoint, form]);

  const onSubmit = (values: DeliveryPointFormValues) => {
    const payload = {
      name: values.name,
      is_active: values.is_active,
    };

    if (isEdit) {
      updateDeliveryPoint.mutate(
        { id: deliveryPoint.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Delivery point updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createDeliveryPoint.mutate(payload, {
        onSuccess: () => {
          toast.success("Delivery point created successfully");
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
              <FieldLabel htmlFor="delivery-point-name" className="text-xs">
                Name
              </FieldLabel>
              <Input
                id="delivery-point-name"
                placeholder="e.g. หลังคลังสินค้า"
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
                    id="delivery-point-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FieldLabel
                htmlFor="delivery-point-is-active"
                className="text-xs"
              >
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
