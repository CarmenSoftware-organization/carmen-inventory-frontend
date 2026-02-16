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

interface DatePickerProps {
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly fromDate?: Date;
  readonly size?: "xs" | "sm" | "default";
}

export function DatePicker({
  value,
  onValueChange,
  disabled,
  placeholder = "Pick a date",
  className,
  fromDate,
  size = "sm",
}: DatePickerProps) {
  const { dateFormat } = useProfile();
  const [open, setOpen] = useState(false);

  const selected = value ? new Date(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onValueChange?.(date.toISOString());
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          size={size}
          className={cn(
            "justify-start font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon />
          {value ? formatDate(value, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          disabled={fromDate ? { before: fromDate } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
