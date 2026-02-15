import { Controller, type UseFormReturn, type FieldArrayWithId } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import type { PrFormValues } from "./purchase-request-form";

type ItemField = FieldArrayWithId<PrFormValues, "items", "id">;

interface PrItemExpandProps {
  item: ItemField;
  form: UseFormReturn<PrFormValues>;
  disabled: boolean;
  itemFields: ItemField[];
}

export function PrItemExpand({
  item,
  form,
  disabled,
  itemFields,
}: PrItemExpandProps) {
  const index = itemFields.findIndex((f) => f.id === item.id);
  if (index === -1) return null;
  return (
    <div className="px-2 py-3 space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        Vendor
      </label>
      <Controller
        control={form.control}
        name={`items.${index}.vendor_id`}
        render={({ field }) => (
          <LookupVendor
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          />
        )}
      />
      <label className="text-xs font-medium text-muted-foreground">
        Description
      </label>
      <Input
        placeholder="Item description"
        className="h-7 text-xs"
        disabled={disabled}
        {...form.register(`items.${index}.description`)}
      />
    </div>
  );
}
