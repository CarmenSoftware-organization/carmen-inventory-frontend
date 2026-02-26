"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { useExchangeRateUpdate } from "@/hooks/use-exchange-rate";
import type { ExchangeRateItem } from "@/types/exchange-rate";

const schema = z.object({
  exchange_rate: z.number().min(0, "Exchange rate must be >= 0"),
});

type FormValues = z.infer<typeof schema>;

interface ExchangeRateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly item: ExchangeRateItem | null;
}

export function ExchangeRateDialog({
  open,
  onOpenChange,
  item,
}: ExchangeRateDialogProps) {
  const updateRate = useExchangeRateUpdate();
  const isPending = updateRate.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { exchange_rate: 0 },
  });

  useEffect(() => {
    if (open && item) {
      form.reset({ exchange_rate: item.exchange_rate });
    }
  }, [open, item, form]);

  const onSubmit = (values: FormValues) => {
    if (!item) return;
    updateRate.mutate(
      { id: item.id, exchange_rate: values.exchange_rate },
      {
        onSuccess: () => {
          toast.success("Exchange rate updated successfully");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-xs gap-3 p-4">
        <DialogHeader className="gap-0 pb-1">
          <DialogTitle className="text-sm">Edit Exchange Rate</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel>Currency Code</FieldLabel>
              <Input
                className="h-8 text-sm"
                value={item?.currency_code ?? ""}
                disabled
              />
            </Field>

            <Field data-invalid={!!form.formState.errors.exchange_rate}>
              <FieldLabel>Exchange Rate</FieldLabel>
              <Input
                type="number"
                min={0}
                step={0.0001}
                className="h-8 text-sm"
                disabled={isPending}
                {...form.register("exchange_rate", { valueAsNumber: true })}
              />
              <FieldError>
                {form.formState.errors.exchange_rate?.message}
              </FieldError>
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
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
