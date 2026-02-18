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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateCurrency, useUpdateCurrency } from "@/hooks/use-currency";
import { useExternalExchangeRates } from "@/hooks/use-exchange-rate";
import { useProfile } from "@/hooks/use-profile";
import { currenciesIso } from "@/constant/currencies-iso";
import type { Currency } from "@/types/currency";
import { getModeLabels } from "@/types/form";

const currencySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(5, "Symbol max 5 characters"),
  exchange_rate: z.number().positive("Exchange rate must be greater than 0"),
  description: z.string(),
  is_active: z.boolean(),
});

type CurrencyFormValues = z.infer<typeof currencySchema>;

interface CurrencyDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currency?: Currency | null;
}

export function CurrencyDialog({
  open,
  onOpenChange,
  currency,
}: CurrencyDialogProps) {
  const isEdit = !!currency;
  const createCurrency = useCreateCurrency();
  const updateCurrency = useUpdateCurrency();
  const isPending = createCurrency.isPending || updateCurrency.isPending;
  const labels = getModeLabels(isEdit ? "edit" : "add", "Currency");

  const { defaultCurrencyCode } = useProfile();
  const baseCurrency = defaultCurrencyCode ?? "THB";
  const { data: exchangeRates } = useExternalExchangeRates(baseCurrency);

  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema) as Resolver<CurrencyFormValues>,
    defaultValues: {
      code: "",
      name: "",
      symbol: "",
      exchange_rate: 0.01,
      description: "",
      is_active: true,
    },
  });

  const watchedCode = form.watch("code");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset(
        currency
          ? {
              code: currency.code,
              name: currency.name,
              symbol: currency.symbol,
              exchange_rate: currency.exchange_rate,
              description: currency.description,
              is_active: currency.is_active,
            }
          : {
              code: "",
              name: "",
              symbol: "",
              exchange_rate: 0.01,
              description: "",
              is_active: true,
            },
      );
    }
  }, [open, currency, form]);

  // Auto-fill in ADD mode when code changes
  useEffect(() => {
    if (isEdit || !watchedCode) return;
    const selected = currenciesIso.find((c) => c.code === watchedCode);
    if (!selected) return;

    form.setValue("name", selected.name);
    form.setValue("symbol", selected.symbol);
    form.setValue(
      "exchange_rate",
      exchangeRates?.[watchedCode] ?? 0.01,
    );
    form.setValue("description", `${selected.name} (${selected.country})`);
  }, [watchedCode, isEdit, exchangeRates, form]);

  const onSubmit = (values: CurrencyFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      symbol: values.symbol,
      exchange_rate: values.exchange_rate,
      description: values.description ?? "",
      is_active: values.is_active,
    };

    if (isEdit) {
      updateCurrency.mutate(
        { id: currency.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Currency updated successfully");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createCurrency.mutate(payload, {
        onSuccess: () => {
          toast.success("Currency created successfully");
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
          <DialogTitle className="text-sm">{labels.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FieldGroup className="gap-3">
            <Field data-invalid={!!form.formState.errors.code}>
              <FieldLabel className="text-xs">Code</FieldLabel>
              <Controller
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isEdit || isPending}
                  >
                    <SelectTrigger className="h-8 w-full text-sm">
                      <SelectValue placeholder="Select currency code" />
                    </SelectTrigger>
                    <SelectContent>
                      {currenciesIso.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{form.formState.errors.code?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="currency-name" className="text-xs">
                Name
              </FieldLabel>
              <Input
                id="currency-name"
                placeholder="e.g. United States Dollar"
                className="h-8 text-sm"
                disabled={isPending}
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.symbol}>
              <FieldLabel htmlFor="currency-symbol" className="text-xs">
                Symbol
              </FieldLabel>
              <Input
                id="currency-symbol"
                placeholder="e.g. $, ฿, €"
                className="h-8 text-sm"
                disabled
                {...form.register("symbol")}
              />
              <FieldError>{form.formState.errors.symbol?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.exchange_rate}>
              <FieldLabel htmlFor="currency-exchange-rate" className="text-xs">
                Exchange Rate
              </FieldLabel>
              <Input
                id="currency-exchange-rate"
                type="number"
                step="any"
                placeholder="e.g. 0.03195"
                className="h-8 text-sm"
                disabled
                {...form.register("exchange_rate", { valueAsNumber: true })}
              />
              <FieldError>
                {form.formState.errors.exchange_rate?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="currency-description" className="text-xs">
                Description
              </FieldLabel>
              <Textarea
                id="currency-description"
                placeholder="Optional"
                className="text-sm"
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
                    id="currency-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                )}
              />
              <FieldLabel htmlFor="currency-is-active" className="text-xs">
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
