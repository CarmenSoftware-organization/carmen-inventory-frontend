"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { isSameDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import { usePriceListTemplate } from "@/hooks/use-price-list-template";
import type { RfpFormValues } from "./rpl-form-schema";
import { STATUS_OPTIONS } from "./rpl-form-schema";

interface Props {
  readonly form: UseFormReturn<RfpFormValues>;
  readonly disabled: boolean;
}

export function RequestPriceListGeneralFields({ form, disabled }: Props) {
  const { data: templateData } = usePriceListTemplate({ perpage: -1 });
  const templates = templateData?.data ?? [];
  const { dateFormat } = useProfile();

  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");

  return (
    <FieldGroup className="max-w-2xl gap-3 pt-4">
      <Field data-invalid={!!form.formState.errors.name} className="col-span-2">
        <FieldLabel className="text-xs">Name</FieldLabel>
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <Input
              {...field}
              placeholder="e.g. RFQ - Fresh Produce Feb 2026"
              className="h-8 text-sm"
              disabled={disabled}
            />
          )}
        />
        <FieldError>{form.formState.errors.name?.message}</FieldError>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field data-invalid={!!form.formState.errors.status}>
          <FieldLabel className="text-xs">Status</FieldLabel>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.pricelist_template_id}>
          <FieldLabel className="text-xs">Price List Template</FieldLabel>
          <Controller
            control={form.control}
            name="pricelist_template_id"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>
            {form.formState.errors.pricelist_template_id?.message}
          </FieldError>
        </Field>
      </div>

      {/* Date Range Picker - Calendar dual month */}
      <Field
        data-invalid={
          !!form.formState.errors.start_date || !!form.formState.errors.end_date
        }
        className="col-span-2"
      >
        <FieldLabel className="text-xs">Validity Period</FieldLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal h-8 text-xs",
                !startDate && "text-muted-foreground",
              )}
              disabled={disabled}
            >
              {startDate && endDate ? (
                <>
                  <span>
                    {formatDate(startDate, dateFormat || "yyyy-MM-dd")}
                  </span>
                  {" - "}
                  <span>{formatDate(endDate, dateFormat || "yyyy-MM-dd")}</span>
                </>
              ) : (
                <span>Pick a date range</span>
              )}
              <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={startDate ? new Date(startDate) : undefined}
              selected={{
                from: startDate ? new Date(startDate) : undefined,
                to: endDate ? new Date(endDate) : undefined,
              }}
              onSelect={(range, selectedDay) => {
                const currentStart = form.getValues("start_date");

                if (!range) {
                  if (
                    currentStart &&
                    selectedDay &&
                    isSameDay(new Date(currentStart), selectedDay)
                  ) {
                    form.setValue("end_date", selectedDay.toISOString(), {
                      shouldDirty: true,
                    });
                  } else {
                    form.setValue("start_date", "", { shouldDirty: true });
                    form.setValue("end_date", "", { shouldDirty: true });
                  }
                  return;
                }

                if (range.from) {
                  form.setValue("start_date", range.from.toISOString(), {
                    shouldDirty: true,
                  });
                } else {
                  form.setValue("start_date", "", { shouldDirty: true });
                }

                if (range.to) {
                  form.setValue("end_date", range.to.toISOString(), {
                    shouldDirty: true,
                  });
                } else {
                  form.setValue("end_date", "", { shouldDirty: true });
                }
              }}
              disabled={(date) => date < new Date("1900-01-01")}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <FieldError>{form.formState.errors.start_date?.message}</FieldError>
        {form.formState.errors.end_date && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {form.formState.errors.end_date.message as string}
          </p>
        )}
      </Field>

      <Field>
        <FieldLabel className="text-xs">Custom Message</FieldLabel>
        <Textarea
          placeholder="Optional message for vendors"
          className="text-sm"
          rows={6}
          disabled={disabled}
          {...form.register("custom_message")}
        />
      </Field>
    </FieldGroup>
  );
}
