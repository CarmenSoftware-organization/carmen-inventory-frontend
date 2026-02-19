import type { ProductFormInstance } from "@/types/product";
import { PRODUCT_ATTRIBUTE_LABELS } from "@/types/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Controller, useFieldArray } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface ProductInfoTabProps {
  form: ProductFormInstance;
  isDisabled: boolean;
}

export default function ProductInfoTab({
  form,
  isDisabled,
}: ProductInfoTabProps) {
  const {
    fields: infoFields,
    append: appendInfo,
    remove: removeInfo,
  } = useFieldArray({ control: form.control, name: "info" });

  const isView = isDisabled;

  return (
    <div className="max-w-2xl space-y-4">
      <FieldGroup className="gap-3">
        <div className="flex items-center gap-6">
          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_used_in_recipe"
              render={({ field }) => (
                <Checkbox
                  id="product-is-used-in-recipe"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel htmlFor="product-is-used-in-recipe" className="text-xs">
              Used in Recipe
            </FieldLabel>
          </Field>

          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_sold_directly"
              render={({ field }) => (
                <Checkbox
                  id="product-is-sold-directly"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel htmlFor="product-is-sold-directly" className="text-xs">
              Sold Directly
            </FieldLabel>
          </Field>
        </div>

        {/* Price, Barcode, SKU */}
        <div className="grid grid-cols-3 gap-3">
          <Field>
            <FieldLabel className="text-xs">Price</FieldLabel>
            <Input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              className="h-8 text-sm text-right"
              disabled={isDisabled}
              {...form.register("price")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="product-barcode" className="text-xs">
              Barcode
            </FieldLabel>
            <Input
              id="product-barcode"
              placeholder="e.g. 8851234567890"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("barcode")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="product-sku" className="text-xs">
              SKU
            </FieldLabel>
            <Input
              id="product-sku"
              placeholder="e.g. ESP-250G-TH"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("sku")}
            />
          </Field>
        </div>

        {/* Deviation limits with % */}
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel className="text-xs">
              Price Deviation Limit (%)
            </FieldLabel>
            <div className="relative">
              <Input
                type="number"
                step="any"
                min="0"
                max="100"
                placeholder="0"
                className="h-8 text-sm pr-8 text-right"
                disabled={isDisabled}
                {...form.register("price_deviation_limit")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </Field>

          <Field>
            <FieldLabel className="text-xs">Qty Deviation Limit (%)</FieldLabel>
            <div className="relative">
              <Input
                type="number"
                step="any"
                min="0"
                max="100"
                placeholder="0"
                className="h-8 text-sm pr-8 text-right"
                disabled={isDisabled}
                {...form.register("qty_deviation_limit")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
          </Field>
        </div>
      </FieldGroup>

      {/* Additional Info Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Additional Info{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({infoFields.length})
            </span>
          </h2>
          {!isDisabled && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() =>
                appendInfo({ label: "", value: "", data_type: "string" })
              }
            >
              <Plus />
              Add
            </Button>
          )}
        </div>

        {infoFields.length === 0 && (
          <p className="text-xs text-muted-foreground">No additional info</p>
        )}

        {infoFields.length > 0 && isView && (
          /* View mode: read-only grid */
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {infoFields.map((field, index) => {
              const label = form.getValues(`info.${index}.label`);
              const value = form.getValues(`info.${index}.value`);
              return (
                <div key={field.id} className="flex items-baseline gap-2">
                  <span className="text-xs font-medium capitalize">
                    {label.replaceAll("_", " ")}:
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {value || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {infoFields.length > 0 && !isView && (
          /* Edit mode: editable table */
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-1.5 text-left font-medium">Label</th>
                  <th className="px-3 py-1.5 text-left font-medium">Value</th>
                  <th className="px-3 py-1.5 text-left font-medium w-28">
                    Type
                  </th>
                  <th className="px-3 py-1.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {infoFields.map((field, index) => (
                  <tr key={field.id} className="border-b last:border-0">
                    <td className="px-2 py-1">
                      <Controller
                        control={form.control}
                        name={`info.${index}.label`}
                        render={({ field: labelField }) => (
                          <Select
                            value={labelField.value || "custom"}
                            onValueChange={(v) =>
                              labelField.onChange(v === "custom" ? "" : v)
                            }
                          >
                            <SelectTrigger className="h-7 text-xs border-0 shadow-none bg-transparent">
                              <SelectValue placeholder="Select label" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_ATTRIBUTE_LABELS.map((lbl) => (
                                <SelectItem key={lbl} value={lbl}>
                                  {lbl.replaceAll("_", " ")}
                                </SelectItem>
                              ))}
                              <SelectItem value="custom">Custom...</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        placeholder="Value"
                        className="h-7 text-xs border-0 shadow-none bg-transparent px-1"
                        {...form.register(`info.${index}.value`)}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Controller
                        control={form.control}
                        name={`info.${index}.data_type`}
                        render={({ field: dtField }) => (
                          <Select
                            value={dtField.value}
                            onValueChange={dtField.onChange}
                          >
                            <SelectTrigger className="h-7 text-xs border-0 shadow-none bg-transparent">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeInfo(index)}
                      >
                        <X />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
