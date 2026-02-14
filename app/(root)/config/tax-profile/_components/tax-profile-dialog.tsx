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
import { toast } from "sonner";
import {
  useCreateTaxProfile,
  useUpdateTaxProfile,
} from "@/hooks/use-tax-profile";
import type { TaxProfile } from "@/types/tax-profile";

const taxProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tax_rate: z.number().min(0, "Tax rate must be positive"),
  is_active: z.boolean(),
});

type TaxProfileFormValues = z.infer<typeof taxProfileSchema>;

interface TaxProfileDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly taxProfile?: TaxProfile | null;
}

export function TaxProfileDialog({
  open,
  onOpenChange,
  taxProfile,
}: TaxProfileDialogProps) {
  const isEdit = !!taxProfile;
  const createTaxProfile = useCreateTaxProfile();
  const updateTaxProfile = useUpdateTaxProfile();
  const isPending = createTaxProfile.isPending || updateTaxProfile.isPending;

  const form = useForm<TaxProfileFormValues>({
    resolver: zodResolver(taxProfileSchema),
    defaultValues: { name: "", tax_rate: 0, is_active: true },
  });

  const onSubmit = (values: TaxProfileFormValues) => {
    const payload = {
      name: values.name,
      tax_rate: values.tax_rate,
      is_active: values.is_active,
    };

    if (isEdit) {
      updateTaxProfile.mutate(
        { id: taxProfile.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Tax profile updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createTaxProfile.mutate(payload, {
        onSuccess: () => {
          toast.success("Tax profile created successfully");
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
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent
        className="sm:max-w-sm gap-3 p-4"
        onOpenAutoFocus={() =>
          form.reset(
            taxProfile
              ? {
                  name: taxProfile.name,
                  tax_rate: taxProfile.tax_rate,
                  is_active: taxProfile.is_active,
                }
              : { name: "", tax_rate: 0, is_active: true },
          )
        }
      >
        <DialogHeader className="gap-0 pb-1">
          <DialogTitle className="text-sm">
            {isEdit ? "Edit Tax Profile" : "Add Tax Profile"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FieldGroup className="gap-3">
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="tax-profile-name" className="text-xs">
                Name
              </FieldLabel>
              <Input
                id="tax-profile-name"
                placeholder="e.g. VAT 7%, None"
                className="h-8 text-sm"
                disabled={isPending}
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.tax_rate}>
              <FieldLabel htmlFor="tax-profile-rate" className="text-xs">
                Tax Rate (%)
              </FieldLabel>
              <Input
                id="tax-profile-rate"
                type="number"
                step="any"
                placeholder="e.g. 7"
                className="h-8 text-sm text-right"
                disabled={isPending}
                {...form.register("tax_rate", { valueAsNumber: true })}
              />
              <FieldError>{form.formState.errors.tax_rate?.message}</FieldError>
            </Field>

            <Field orientation="horizontal">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox
                    id="tax-profile-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FieldLabel htmlFor="tax-profile-is-active" className="text-xs">
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
