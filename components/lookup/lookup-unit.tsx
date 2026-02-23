"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnitDialog } from "@/components/share/unit-dialog";
import { useUnit } from "@/hooks/use-unit";
import { LookupCombobox } from "./lookup-combobox";

interface LookupUnitProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly excludeIds?: string[];
  readonly size?: "xs" | "sm";
}

export function LookupUnit({
  value,
  onValueChange,
  disabled,
  placeholder = "Select unit",
  className,
  excludeIds,
  size = "sm",
}: LookupUnitProps) {
  const { data, isLoading } = useUnit({ perpage: -1 });
  const units = useMemo(() => {
    const active = data?.data?.filter((u) => u.is_active) ?? [];
    if (!excludeIds || excludeIds.length === 0) return active;
    const excluded = new Set(excludeIds);
    return active.filter((u) => !excluded.has(u.id));
  }, [data, excludeIds]);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <LookupCombobox
        value={value}
        onValueChange={(id) => onValueChange(id)}
        items={units}
        getId={(u) => u.id}
        getLabel={(u) => u.name}
        placeholder={placeholder}
        searchPlaceholder="Search unit..."
        disabled={disabled}
        isLoading={isLoading}
        className={className}
        size={size}
        headerSlot={
          <Button
            size="xs"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
            onClick={() => setDialogOpen(true)}
            type="button"
            aria-label="Add new unit"
          >
            <Plus className="h-3 w-3" />
          </Button>
        }
      />
      <UnitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(id) => onValueChange(id)}
      />
    </>
  );
}
