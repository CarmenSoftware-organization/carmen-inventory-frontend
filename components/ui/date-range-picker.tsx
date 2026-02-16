"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  readonly value?: DateRange;
  readonly onValueChange?: (value: DateRange) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly numberOfMonths?: number;
}

export function DateRangePicker({
  value,
  onValueChange,
  disabled,
  placeholder = "Pick a date range",
  className,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const { dateFormat } = useProfile();
  const [open, setOpen] = useState(false);

  const selected =
    value?.from || value?.to
      ? {
          from: value.from ? new Date(value.from) : undefined,
          to: value.to ? new Date(value.to) : undefined,
        }
      : undefined;

  let displayValue: string | null = null;
  if (value?.from && value.to) {
    displayValue = `${formatDate(value.from, dateFormat)} - ${formatDate(value.to, dateFormat)}`;
  } else if (value?.from) {
    displayValue = formatDate(value.from, dateFormat);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start font-normal",
            !displayValue && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={(range) => {
            if (!range) return;
            const next: DateRange = {
              from: range.from?.toISOString() ?? "",
              to: range.to?.toISOString() ?? "",
            };
            onValueChange?.(next);
            if (range.from && range.to) {
              setOpen(false);
            }
          }}
          defaultMonth={selected?.from}
          numberOfMonths={numberOfMonths}
        />
      </PopoverContent>
    </Popover>
  );
}
