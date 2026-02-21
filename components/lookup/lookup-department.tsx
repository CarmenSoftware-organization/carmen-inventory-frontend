"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDepartment } from "@/hooks/use-department";

interface LookupDepartmentProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
}

export function LookupDepartment({
  value,
  onValueChange,
  disabled,
  placeholder = "Select department",
  className,
}: LookupDepartmentProps) {
  const { data } = useDepartment();
  const departments = useMemo(() => data?.data ?? [], [data?.data]);

  const [open, setOpen] = useState(false);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return departments.find((d) => d.id === value)?.name ?? null;
  }, [value, departments]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn(
            "h-8 flex justify-between items-center pl-3 pr-1 text-sm",
            className,
          )}
          disabled={disabled}
        >
          <span className={cn(!selectedName && "text-muted-foreground")}>
            {selectedName ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command
          filter={(value, search) => {
            if (!search) return 1;
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput
            placeholder="Search department..."
            className="placeholder:text-xs"
          />
          <CommandList>
            <CommandEmpty>No departments found.</CommandEmpty>
            <CommandGroup>
              {departments.map((dept) => (
                <CommandItem
                  key={dept.id}
                  value={dept.name}
                  onSelect={() => {
                    onValueChange(dept.id);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {dept.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === dept.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
