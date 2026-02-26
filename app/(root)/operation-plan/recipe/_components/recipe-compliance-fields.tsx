import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ALLERGEN_OPTIONS } from "@/constant/recipe";
import type { RecipeFormValues } from "./recipe-form-schema";

interface RecipeComplianceFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

export function RecipeComplianceFields({
  form,
  isDisabled,
}: RecipeComplianceFieldsProps) {
  return (
    <div className="space-y-4">
      {/* ── Safety & Compliance ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold border-b pb-2">Safety & Compliance</h2>
          <Badge variant="warning-light" size="sm">
            Required for labeling
          </Badge>
        </div>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel>Allergens</FieldLabel>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {ALLERGEN_OPTIONS.map((allergen) => (
                <Controller
                  key={allergen.value}
                  control={form.control}
                  name="allergens.standard"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={field.value?.includes(allergen.value) ?? false}
                        onCheckedChange={(checked) => {
                          const current = field.value ?? [];
                          field.onChange(
                            checked
                              ? [...current, allergen.value]
                              : current.filter(
                                  (v: string) => v !== allergen.value,
                                ),
                          );
                        }}
                        disabled={isDisabled}
                      />
                      {allergen.label}
                    </label>
                  )}
                />
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="recipe-custom-allergens">
              Other Allergens
            </FieldLabel>
            <Input
              id="recipe-custom-allergens"
              placeholder="e.g. Kiwi, Latex (comma-separated)"
              className="h-8 text-sm"
              disabled={isDisabled}
              maxLength={256}
              {...form.register("allergens.custom")}
            />
            <FieldDescription>
              Additional allergens not in the standard list, separated by commas
            </FieldDescription>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="recipe-carbon-footprint">
                Carbon Footprint
              </FieldLabel>
              <div className="relative">
                <Input
                  id="recipe-carbon-footprint"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-8 pr-16 text-right text-sm"
                  disabled={isDisabled}
                  {...form.register("carbon_footprint")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  kg CO2e
                </span>
              </div>
              <FieldDescription>
                Estimated carbon emissions per batch
              </FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Organization ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Organization</h2>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="recipe-tags">
              Tags
            </FieldLabel>
            <Textarea
              id="recipe-tags"
              placeholder={"seasonal\nsignature\nhigh-margin\ngluten-free"}
              className="font-mono text-sm"
              rows={3}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("tags")}
            />
            <FieldDescription>
              One tag per line. Used for filtering and reporting across the
              recipe catalog.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Media ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Media</h2>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="recipe-images">
              Image URLs
            </FieldLabel>
            <Textarea
              id="recipe-images"
              placeholder={
                "https://cdn.example.com/recipe-photo-1.jpg\nhttps://cdn.example.com/recipe-photo-2.jpg"
              }
              className="font-mono text-sm"
              rows={3}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("images")}
            />
            <FieldDescription>
              One URL per line. First image is used as the primary thumbnail.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Custom Data ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Custom Data</h2>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="recipe-info">
              Info (JSON)
            </FieldLabel>
            <Textarea
              id="recipe-info"
              placeholder={'{\n  "key": "value"\n}'}
              className="font-mono text-sm"
              rows={3}
              disabled={isDisabled}
              maxLength={1024}
              {...form.register("info")}
            />
            <FieldDescription>
              Additional custom metadata as JSON
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="recipe-dimension">
              Dimension (JSON)
            </FieldLabel>
            <Textarea
              id="recipe-dimension"
              placeholder={'{\n  "weight": 250,\n  "unit": "g"\n}'}
              className="font-mono text-sm"
              rows={3}
              disabled={isDisabled}
              maxLength={1024}
              {...form.register("dimension")}
            />
            <FieldDescription>
              Physical dimensions or measurements as JSON
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Inventory Settings ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold border-b pb-2">Inventory Settings</h2>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="deduct_from_stock"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <div>
              <FieldLabel>Deduct from Stock</FieldLabel>
              <FieldDescription>
                When enabled, producing this recipe will automatically reduce
                ingredient inventory quantities
              </FieldDescription>
            </div>
          </Field>
        </FieldGroup>
      </section>
    </div>
  );
}
