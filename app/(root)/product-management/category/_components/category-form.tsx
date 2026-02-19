"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import type { CategoryNode } from "@/types/category";
import type { FormMode } from "@/types/form";

export type CategoryType = "category" | "subcategory" | "itemgroup";

const categorySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean(),
  price_deviation_limit: z.coerce.number().min(0).max(100),
  qty_deviation_limit: z.coerce.number().min(0).max(100),
  is_used_in_recipe: z.boolean(),
  is_sold_directly: z.boolean(),
  tax_profile_id: z.string().optional(),
  tax_rate: z.coerce.number().min(0),
  product_category_id: z.string().optional(),
  product_subcategory_id: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  readonly type: CategoryType;
  readonly mode: FormMode;
  readonly selectedNode?: CategoryNode;
  readonly parentNode?: CategoryNode;
  readonly onSubmit: (data: CategoryFormValues) => void;
  readonly onCancel: () => void;
  readonly isPending?: boolean;
}

export function CategoryForm({
  type,
  mode,
  selectedNode,
  parentNode,
  onSubmit,
  onCancel,
  isPending,
}: CategoryFormProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<CategoryFormValues | null>(
    null,
  );

  const parentDisplay = useMemo(() => {
    if (type === "category") return "";
    if (parentNode) return `${parentNode.code} - ${parentNode.name}`;
    return "";
  }, [type, parentNode]);

  const defaultValues = useMemo((): CategoryFormValues => {
    const base: CategoryFormValues = {
      code: selectedNode?.code ?? "",
      name: selectedNode?.name ?? "",
      description: selectedNode?.description ?? "",
      is_active: selectedNode?.is_active ?? true,
      price_deviation_limit:
        selectedNode?.price_deviation_limit ??
        parentNode?.price_deviation_limit ??
        0,
      qty_deviation_limit:
        selectedNode?.qty_deviation_limit ??
        parentNode?.qty_deviation_limit ??
        0,
      is_used_in_recipe:
        selectedNode?.is_used_in_recipe ??
        parentNode?.is_used_in_recipe ??
        false,
      is_sold_directly:
        selectedNode?.is_sold_directly ?? parentNode?.is_sold_directly ?? false,
      tax_profile_id:
        selectedNode?.tax_profile_id ?? parentNode?.tax_profile_id ?? "",
      tax_rate: selectedNode?.tax_rate ?? parentNode?.tax_rate ?? 0,
    };
    if (type === "subcategory")
      base.product_category_id =
        selectedNode?.product_category_id ?? parentNode?.id ?? "";
    if (type === "itemgroup")
      base.product_subcategory_id =
        selectedNode?.product_subcategory_id ?? parentNode?.id ?? "";
    return base;
  }, [type, selectedNode, parentNode]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleFormSubmit = (data: CategoryFormValues) => {
    if (
      mode === "edit" &&
      selectedNode &&
      (selectedNode.is_used_in_recipe !== data.is_used_in_recipe ||
        selectedNode.is_sold_directly !== data.is_sold_directly)
    ) {
      setPendingData(data);
      setShowConfirm(true);
      return;
    }
    onSubmit(data);
  };

  const PARENT_LABELS: Record<CategoryType, string> = {
    category: "",
    subcategory: "Category",
    itemgroup: "Subcategory",
  };
  const parentLabel = PARENT_LABELS[type];

  return (
    <>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-2"
      >
        {/* Parent reference */}
        {type !== "category" && (
          <div>
            <span className="text-xs font-medium text-muted-foreground tracking-wider">
              {parentLabel}
            </span>
            <Input
              value={parentDisplay}
              disabled
              className="h-7 text-xs bg-muted/50"
            />
          </div>
        )}

        {/* Code + Name row */}
        <div className="grid grid-cols-[100px_1fr] gap-1.5">
          <div>
            <label
              htmlFor="code"
              className="text-xs font-medium text-muted-foreground tracking-wider"
            >
              Code *
            </label>
            <Input
              id="code"
              className="h-7 text-xs font-mono"
              maxLength={5}
              disabled={isPending}
              {...form.register("code")}
            />
            {form.formState.errors.code && (
              <p className="text-[10px] text-destructive">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="name"
              className="text-xs font-medium text-muted-foreground tracking-wider"
            >
              Name *
            </label>
            <Input
              id="name"
              className="h-7 text-xs"
              maxLength={100}
              disabled={isPending}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-[10px] text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
        </div>

        {/* Tax Profile */}
        <div>
          <span className="text-xs font-medium text-muted-foreground tracking-wider">
            Tax Profile
          </span>
          <Controller
            control={form.control}
            name="tax_profile_id"
            render={({ field }) => (
              <LookupTaxProfile
                value={field.value ?? ""}
                onValueChange={(id, taxRate) => {
                  field.onChange(id);
                  form.setValue("tax_rate", taxRate);
                }}
                disabled={isPending}
                size="xs"
              />
            )}
          />
        </div>

        {/* Deviation limits */}
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label
              htmlFor="qty_deviation_limit"
              className="text-xs font-medium text-muted-foreground tracking-wider"
            >
              Qty Dev. %
            </label>
            <div className="relative">
              <Input
                id="qty_deviation_limit"
                type="number"
                className="h-7 text-xs pr-6 text-right"
                min={0}
                max={100}
                disabled={isPending}
                {...form.register("qty_deviation_limit", {
                  valueAsNumber: true,
                })}
              />
              <Percent className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground/50" />
            </div>
          </div>
          <div>
            <label
              htmlFor="price_deviation_limit"
              className="text-xs font-medium text-muted-foreground tracking-wider"
            >
              Price Dev. %
            </label>
            <div className="relative">
              <Input
                id="price_deviation_limit"
                type="number"
                className="h-7 text-xs pr-6 text-right"
                min={0}
                max={100}
                disabled={isPending}
                {...form.register("price_deviation_limit", {
                  valueAsNumber: true,
                })}
              />
              <Percent className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        {/* Flags row */}
        <div className="flex items-center gap-4 py-1 border-y border-dashed border-border/60">
          <span className="flex items-center gap-1.5 text-xs">
            <Controller
              control={form.control}
              name="is_used_in_recipe"
              render={({ field }) => (
                <Checkbox
                  id="is_used_in_recipe"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="h-3.5 w-3.5"
                />
              )}
            />
            <label htmlFor="is_used_in_recipe">Recipe</label>
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <Controller
              control={form.control}
              name="is_sold_directly"
              render={({ field }) => (
                <Checkbox
                  id="is_sold_directly"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="h-3.5 w-3.5"
                />
              )}
            />
            <label htmlFor="is_sold_directly">Sold Directly</label>
          </span>
          <span className="flex items-center gap-1.5 text-xs ml-auto">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="h-3.5 w-3.5"
                />
              )}
            />
            <label htmlFor="is_active">Active</label>
          </span>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="text-xs font-medium text-muted-foreground tracking-wider"
          >
            Description
          </label>
          <Textarea
            id="description"
            className="text-xs min-h-12 resize-none"
            rows={2}
            maxLength={256}
            disabled={isPending}
            {...form.register("description")}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1.5 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
            className="h-7 text-xs px-3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="h-7 text-xs px-3"
          >
            {isPending && "Saving..."}
            {!isPending && mode === "edit" && "Save"}
            {!isPending && mode !== "edit" && "Create"}
          </Button>
        </div>
      </form>

      <DeleteDialog
        open={showConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirm(false);
            setPendingData(null);
          }
        }}
        title="Confirm Changes"
        description='Changing "Recipe" or "Sold Directly" flags may affect child items. Continue?'
        onConfirm={() => {
          if (pendingData) {
            onSubmit(pendingData);
            setShowConfirm(false);
            setPendingData(null);
          }
        }}
      />
    </>
  );
}
