import type { FieldValues, UseFormReturn } from "react-hook-form";

export function getDeleteDescription<T extends FieldValues>(
  index: number | null,
  form: UseFormReturn<T>,
  nameField: string = "product_name",
) {
  if (index === null) return "";
  const name = form.getValues(
    `items.${index}.${nameField}` as unknown as Parameters<typeof form.getValues>[0],
  );
  const label = name || `Item #${index + 1}`;
  return `Are you sure you want to remove "${label}"?`;
}
