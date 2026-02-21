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
import type { RecipeFormValues } from "./recipe-form";

interface RecipeDetailFieldsProps {
  readonly form: UseFormReturn<RecipeFormValues>;
  readonly isDisabled: boolean;
}

export function RecipeDetailFields({
  form,
  isDisabled,
}: RecipeDetailFieldsProps) {
  return (
    <div className="space-y-4">
      {/* ── Safety & Compliance ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Safety & Compliance</h2>
          <Badge variant="warning-light" size="sm">
            Required for labeling
          </Badge>
        </div>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel className="text-xs">Allergens</FieldLabel>
            <Textarea
              placeholder={"Gluten\nDairy\nNuts\nShellfish"}
              className="font-mono text-sm"
              rows={4}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("allergens")}
            />
            <FieldDescription className="text-xs">
              List each allergen on a separate line. Used for menu labeling and
              regulatory compliance.
            </FieldDescription>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel className="text-xs">Carbon Footprint</FieldLabel>
              <div className="relative">
                <Input
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
              <FieldDescription className="text-xs">
                Estimated carbon emissions per batch
              </FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Organization ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Organization</h2>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel className="text-xs">Tags</FieldLabel>
            <Textarea
              placeholder={"seasonal\nsignature\nhigh-margin\ngluten-free"}
              className="font-mono text-sm"
              rows={3}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("tags")}
            />
            <FieldDescription className="text-xs">
              One tag per line. Used for filtering and reporting across the
              recipe catalog.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Media ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Media</h2>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel className="text-xs">Image URLs</FieldLabel>
            <Textarea
              placeholder={
                "https://cdn.example.com/recipe-photo-1.jpg\nhttps://cdn.example.com/recipe-photo-2.jpg"
              }
              className="font-mono text-sm"
              rows={3}
              disabled={isDisabled}
              maxLength={256}
              {...form.register("images")}
            />
            <FieldDescription className="text-xs">
              One URL per line. First image is used as the primary thumbnail.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Inventory Settings ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Inventory Settings</h2>
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
              <FieldLabel className="text-xs">Deduct from Stock</FieldLabel>
              <FieldDescription className="text-xs">
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
