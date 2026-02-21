"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import {
  useCreateCuisine,
  useUpdateCuisine,
  useDeleteCuisine,
} from "@/hooks/use-cuisine";
import type { Cuisine } from "@/types/cuisine";
import type { FormMode } from "@/types/form";
import { CUISINE_REGION_OPTIONS } from "@/constant/cuisine";

function arrayToText(value: string[] | null | undefined): string {
  if (!value || value.length === 0) return "";
  return value.join("\n");
}

function textToArray(value: string): string[] | null {
  const items = value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

function objectToText(value: Record<string, unknown> | null | undefined): string {
  if (!value || Object.keys(value).length === 0) return "";
  return JSON.stringify(value, null, 2);
}

function textToObject(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const cuisineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  note: z.string(),
  region: z.string().min(1, "Region is required"),
  popular_dishes: z.string(),
  key_ingredients: z.string(),
  info: z.string(),
  dimension: z.string(),
  is_active: z.boolean(),
});

type CuisineFormValues = z.infer<typeof cuisineSchema>;

interface CuisineFormProps {
  readonly cuisine?: Cuisine;
}

export function CuisineForm({ cuisine }: CuisineFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(cuisine ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const createCuisine = useCreateCuisine();
  const updateCuisine = useUpdateCuisine();
  const deleteCuisine = useDeleteCuisine();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createCuisine.isPending || updateCuisine.isPending;
  const isDisabled = isView || isPending;

  const form = useForm<CuisineFormValues>({
    resolver: zodResolver(cuisineSchema) as Resolver<CuisineFormValues>,
    defaultValues: cuisine
      ? {
          name: cuisine.name,
          description: cuisine.description ?? "",
          note: cuisine.note ?? "",
          region: cuisine.region,
          popular_dishes: arrayToText(cuisine.popular_dishes),
          key_ingredients: arrayToText(cuisine.key_ingredients),
          info: objectToText(cuisine.info),
          dimension: arrayToText(cuisine.dimension),
          is_active: cuisine.is_active,
        }
      : {
          name: "",
          description: "",
          note: "",
          region: "ASIA",
          popular_dishes: "",
          key_ingredients: "",
          info: "",
          dimension: "",
          is_active: true,
        },
  });

  const onSubmit = (values: CuisineFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      note: values.note || null,
      region: values.region,
      popular_dishes: textToArray(values.popular_dishes),
      key_ingredients: textToArray(values.key_ingredients),
      info: textToObject(values.info),
      dimension: textToArray(values.dimension),
      is_active: values.is_active,
    };

    if (isEdit && cuisine) {
      updateCuisine.mutate(
        { id: cuisine.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Cuisine updated successfully");
            router.push("/operation-plan/cuisine");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else {
      createCuisine.mutate(payload, {
        onSuccess: () => {
          toast.success("Cuisine created successfully");
          router.push("/operation-plan/cuisine");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleBack = () => router.push("/operation-plan/cuisine");

  const handleEdit = () => setMode("edit");

  const handleCancel = () => {
    if (isEdit && cuisine) {
      form.reset({
        name: cuisine.name,
        description: cuisine.description ?? "",
        note: cuisine.note ?? "",
        region: cuisine.region,
        popular_dishes: arrayToText(cuisine.popular_dishes),
        key_ingredients: arrayToText(cuisine.key_ingredients),
        info: objectToText(cuisine.info),
        dimension: arrayToText(cuisine.dimension),
        is_active: cuisine.is_active,
      });
      setMode("view");
    } else {
      router.push("/operation-plan/cuisine");
    }
  };

  const handleDelete = () => {
    if (!cuisine) return;
    deleteCuisine.mutate(cuisine.id, {
      onSuccess: () => {
        toast.success("Cuisine deleted successfully");
        router.push("/operation-plan/cuisine");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Cuisine"
        mode={mode}
        formId="cuisine-form"
        isPending={isPending}
        onBack={handleBack}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onDelete={cuisine ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteCuisine.isPending}
      />

      <form
        id="cuisine-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-6"
      >
        {/* General Information */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">General Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="cuisine-name" className="text-xs" required>
                Name
              </FieldLabel>
              <Input
                id="cuisine-name"
                placeholder="e.g. Thai"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.region}>
              <FieldLabel className="text-xs" required>
                Region
              </FieldLabel>
              <Controller
                control={form.control}
                name="region"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUISINE_REGION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{form.formState.errors.region?.message}</FieldError>
            </Field>

            <Field className="col-span-2">
              <FieldLabel htmlFor="cuisine-description" className="text-xs">
                Description
              </FieldLabel>
              <Textarea
                id="cuisine-description"
                placeholder="Optional"
                className="text-sm"
                rows={2}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("description")}
              />
            </Field>
          </div>
        </div>

        {/* Cuisine Details */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Cuisine Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="cuisine-popular-dishes" className="text-xs">
                Popular Dishes
              </FieldLabel>
              <Textarea
                id="cuisine-popular-dishes"
                placeholder="Optional"
                className="text-sm"
                rows={3}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("popular_dishes")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="cuisine-key-ingredients" className="text-xs">
                Key Ingredients
              </FieldLabel>
              <Textarea
                id="cuisine-key-ingredients"
                placeholder="Optional"
                className="text-sm"
                rows={3}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("key_ingredients")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="cuisine-info" className="text-xs">
                Info
              </FieldLabel>
              <Textarea
                id="cuisine-info"
                placeholder="Optional"
                className="text-sm"
                rows={3}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("info")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="cuisine-dimension" className="text-xs">
                Dimension
              </FieldLabel>
              <Textarea
                id="cuisine-dimension"
                placeholder="Optional"
                className="text-sm"
                rows={3}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("dimension")}
              />
            </Field>
          </div>
        </div>

        {/* Additional */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Additional</h2>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="cuisine-note" className="text-xs">
                Note
              </FieldLabel>
              <Textarea
                id="cuisine-note"
                placeholder="Optional"
                className="text-sm"
                rows={2}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("note")}
              />
            </Field>

            <Field orientation="horizontal">
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox
                    id="cuisine-is-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isDisabled}
                  />
                )}
              />
              <FieldLabel htmlFor="cuisine-is-active" className="text-xs">
                Active
              </FieldLabel>
            </Field>
          </FieldGroup>
        </div>
      </form>

      {cuisine && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteCuisine.isPending && setShowDelete(false)
          }
          title="Delete Cuisine"
          description={`Are you sure you want to delete cuisine "${cuisine.name}"? This action cannot be undone.`}
          isPending={deleteCuisine.isPending}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
