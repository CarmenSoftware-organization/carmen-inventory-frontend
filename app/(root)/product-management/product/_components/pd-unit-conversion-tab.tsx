import { useMemo } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import type { ProductFormInstance } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { LookupUnit } from "@/components/lookup/lookup-unit";
import { Input } from "@/components/ui/input";
import { useUnit } from "@/hooks/use-unit";

interface UnitConversionTabProps {
  form: ProductFormInstance;
  name: "order_units" | "ingredient_units";
  label: string;
  isDisabled: boolean;
}

export default function UnitConversionTab({
  form,
  name,
  label,
  isDisabled,
}: UnitConversionTabProps) {
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name,
  });

  const isOrder = name === "order_units";
  const inventoryUnitId = useWatch({ control: form.control, name: "inventory_unit_id" });
  const isUsedInRecipe = useWatch({ control: form.control, name: "is_used_in_recipe" });

  /* ---- Resolve unit names for preview ---- */
  const { data: unitData } = useUnit({ perpage: -1 });
  const unitMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of unitData?.data ?? []) {
      m.set(u.id, u.name);
    }
    return m;
  }, [unitData?.data]);

  /* ---- Add disabled conditions ---- */
  const addDisabled =
    isDisabled || !inventoryUnitId || (!isOrder && !isUsedInRecipe);

  /* ---- Handle default (radio-like) ---- */
  const handleDefaultChange = (index: number, checked: boolean) => {
    if (!checked) return;
    fields.forEach((field, i) => {
      if (i !== index && field.is_default) {
        update(i, { ...field, is_default: false });
      }
    });
    const current = fields[index];
    update(index, { ...current, is_default: true });
  };

  /* ---- Auto-sync: if from_unit === to_unit, sync qty ---- */
  const handleFromUnitChange = (index: number, unitId: string) => {
    form.setValue(`${name}.${index}.from_unit_id`, unitId);
    const toUnit = form.getValues(`${name}.${index}.to_unit_id`);
    if (unitId && unitId === toUnit) {
      const fromQty = form.getValues(`${name}.${index}.from_unit_qty`);
      form.setValue(`${name}.${index}.to_unit_qty`, fromQty);
    }
  };

  const handleToUnitChange = (index: number, unitId: string) => {
    form.setValue(`${name}.${index}.to_unit_id`, unitId);
    const fromUnit = form.getValues(`${name}.${index}.from_unit_id`);
    if (unitId && unitId === fromUnit) {
      const fromQty = form.getValues(`${name}.${index}.from_unit_qty`);
      form.setValue(`${name}.${index}.to_unit_qty`, fromQty);
    }
  };

  /* ---- Conversion preview ---- */
  const getPreview = (index: number) => {
    const fromId = form.getValues(`${name}.${index}.from_unit_id`);
    const toId = form.getValues(`${name}.${index}.to_unit_id`);
    const fromQty = form.getValues(`${name}.${index}.from_unit_qty`);
    const toQty = form.getValues(`${name}.${index}.to_unit_qty`);
    if (!fromId || !toId) return null;
    const fromName = unitMap.get(fromId) ?? "?";
    const toName = unitMap.get(toId) ?? "?";
    return `${fromQty} ${fromName} = ${toQty} ${toName}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {label}s{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({fields.length})
          </span>
        </h2>
        {!isDisabled && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={addDisabled}
            onClick={() =>
              append({
                from_unit_id: isOrder ? "" : inventoryUnitId,
                from_unit_qty: 1,
                to_unit_id: isOrder ? inventoryUnitId : "",
                to_unit_qty: 1,
                description: "",
                is_default: fields.length === 0,
                is_active: true,
              })
            }
          >
            <Plus />
            Add {label}
          </Button>
        )}
      </div>

      {!isOrder && !isUsedInRecipe && (
        <p className="text-xs text-muted-foreground">
          Enable &quot;Used in Recipe&quot; in Product Info to add ingredient
          units.
        </p>
      )}

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No {label.toLowerCase()}s defined
        </p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-1.5 text-left font-medium w-12">#</th>
                <th className="px-3 py-1.5 text-left font-medium">
                  {isOrder ?? "From Unit"}
                </th>
                <th className="px-3 py-1.5 text-left font-medium w-20">
                  From Qty
                </th>
                <th className="px-3 py-1.5 text-left font-medium">To Unit</th>
                <th className="px-3 py-1.5 text-left font-medium w-20">
                  To Qty
                </th>
                <th className="px-3 py-1.5 text-left font-medium">
                  Conversion
                </th>
                <th className="px-3 py-1.5 text-left font-medium">
                  Description
                </th>
                <th className="px-3 py-1.5 text-center font-medium w-16">
                  Default
                </th>
                <th className="px-3 py-1.5 text-center font-medium w-16">
                  Active
                </th>
                {!isDisabled && <th className="px-3 py-1.5 w-10" />}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const isNew = !field.id;
                const preview = getPreview(index);
                const rowBg = isNew ? "bg-green-50/50" : "bg-amber-50/30";

                return (
                  <tr
                    key={field.id ?? `new-${index}`}
                    className={`border-b last:border-0 ${rowBg}`}
                  >
                    <td className="px-3 py-1.5 text-muted-foreground">
                      {index + 1}
                    </td>

                    {/* From Unit */}
                    <td className="px-1 py-1">
                      {isOrder ? (
                        <Controller
                          control={form.control}
                          name={`${name}.${index}.from_unit_id`}
                          render={({ field: f }) => (
                            <LookupUnit
                              value={f.value}
                              onValueChange={(v) =>
                                handleFromUnitChange(index, v)
                              }
                              disabled={isDisabled}
                            />
                          )}
                        />
                      ) : (
                        <span className="px-2 text-xs text-muted-foreground">
                          {unitMap.get(inventoryUnitId) ?? "—"}
                        </span>
                      )}
                    </td>

                    {/* From Qty */}
                    <td className="px-1 py-1">
                      <Input
                        type="number"
                        step="any"
                        min="1"
                        className="h-7 text-xs border-0 shadow-none bg-transparent px-1"
                        disabled={isDisabled}
                        {...form.register(`${name}.${index}.from_unit_qty`)}
                      />
                    </td>

                    {/* To Unit */}
                    <td className="px-1 py-1">
                      {isOrder ? (
                        <span className="px-2 text-xs text-muted-foreground">
                          {unitMap.get(inventoryUnitId) ?? "—"}
                        </span>
                      ) : (
                        <Controller
                          control={form.control}
                          name={`${name}.${index}.to_unit_id`}
                          render={({ field: f }) => (
                            <LookupUnit
                              value={f.value}
                              onValueChange={(v) =>
                                handleToUnitChange(index, v)
                              }
                              disabled={isDisabled}
                            />
                          )}
                        />
                      )}
                    </td>

                    {/* To Qty */}
                    <td className="px-1 py-1">
                      <Input
                        type="number"
                        step="any"
                        min="1"
                        className="h-7 text-xs border-0 shadow-none bg-transparent px-1"
                        disabled={isDisabled}
                        {...form.register(`${name}.${index}.to_unit_qty`)}
                      />
                    </td>

                    {/* Conversion Preview */}
                    <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                      {preview ?? "—"}
                    </td>

                    {/* Description */}
                    <td className="px-1 py-1">
                      <Input
                        placeholder="e.g. 1 bag = 250g"
                        className="h-7 text-xs border-0 shadow-none bg-transparent px-1"
                        disabled={isDisabled}
                        {...form.register(`${name}.${index}.description`)}
                      />
                    </td>

                    {/* Default (radio-like) */}
                    <td className="px-3 py-1.5 text-center">
                      <Controller
                        control={form.control}
                        name={`${name}.${index}.is_default`}
                        render={({ field: f }) => (
                          <input
                            type="radio"
                            name={`${name}-default`}
                            checked={f.value}
                            onChange={() => handleDefaultChange(index, true)}
                            disabled={isDisabled}
                            className="h-3.5 w-3.5 accent-primary"
                          />
                        )}
                      />
                    </td>

                    {/* Active */}
                    <td className="px-3 py-1.5 text-center">
                      <Controller
                        control={form.control}
                        name={`${name}.${index}.is_active`}
                        render={({ field: f }) => (
                          <input
                            type="checkbox"
                            checked={f.value}
                            onChange={(e) => f.onChange(e.target.checked)}
                            disabled={isDisabled}
                            className="h-3.5 w-3.5 accent-primary"
                          />
                        )}
                      />
                    </td>

                    {!isDisabled && (
                      <td className="px-2 py-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => remove(index)}
                        >
                          <X />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
