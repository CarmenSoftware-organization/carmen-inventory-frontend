"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import {
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from "@/hooks/use-equipment";
import { LookupRecipeCategory } from "@/components/lookup/lookup-recipe-category";
import type { Equipment } from "@/types/equipment";
import type { FormMode } from "@/types/form";

const equipmentSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  category_id: z.string().nullable(),
  brand: z.string(),
  model: z.string(),
  serial_no: z.string(),
  capacity: z.string(),
  power_rating: z.string(),
  station: z.string(),
  operation_instructions: z.string(),
  safety_notes: z.string(),
  cleaning_instructions: z.string(),
  maintenance_schedule: z.string(),
  last_maintenance_date: z.string(),
  next_maintenance_date: z.string(),
  note: z.string(),
  is_active: z.boolean(),
  is_poolable: z.boolean(),
  available_qty: z.coerce.number().min(0, "Min 0"),
  total_qty: z.coerce.number().min(0, "Min 0"),
  usage_count: z.coerce.number().min(0, "Min 0"),
  average_usage_time: z.coerce.number().min(0, "Min 0"),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

function getDefaultValues(equipment?: Equipment): EquipmentFormValues {
  if (equipment) {
    return {
      code: equipment.code,
      name: equipment.name,
      description: equipment.description ?? "",
      category_id: equipment.category_id,
      brand: equipment.brand ?? "",
      model: equipment.model ?? "",
      serial_no: equipment.serial_no ?? "",
      capacity: equipment.capacity ?? "",
      power_rating: equipment.power_rating ?? "",
      station: equipment.station ?? "",
      operation_instructions: equipment.operation_instructions ?? "",
      safety_notes: equipment.safety_notes ?? "",
      cleaning_instructions: equipment.cleaning_instructions ?? "",
      maintenance_schedule: equipment.maintenance_schedule ?? "",
      last_maintenance_date: equipment.last_maintenance_date ?? "",
      next_maintenance_date: equipment.next_maintenance_date ?? "",
      note: equipment.note ?? "",
      is_active: equipment.is_active,
      is_poolable: equipment.is_poolable,
      available_qty: equipment.available_qty,
      total_qty: equipment.total_qty,
      usage_count: equipment.usage_count,
      average_usage_time: equipment.average_usage_time,
    };
  }
  return {
    code: "",
    name: "",
    description: "",
    category_id: null,
    brand: "",
    model: "",
    serial_no: "",
    capacity: "",
    power_rating: "",
    station: "",
    operation_instructions: "",
    safety_notes: "",
    cleaning_instructions: "",
    maintenance_schedule: "",
    last_maintenance_date: "",
    next_maintenance_date: "",
    note: "",
    is_active: true,
    is_poolable: false,
    available_qty: 1,
    total_qty: 1,
    usage_count: 0,
    average_usage_time: 0,
  };
}

interface EquipmentFormProps {
  readonly equipment?: Equipment;
}

export function EquipmentForm({ equipment }: EquipmentFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(equipment ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const deleteEquipment = useDeleteEquipment();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createEquipment.isPending || updateEquipment.isPending;
  const isDisabled = isView || isPending;

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema) as Resolver<EquipmentFormValues>,
    defaultValues: getDefaultValues(equipment),
  });

  const onSubmit = (values: EquipmentFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      description: values.description || null,
      category_id: values.category_id,
      brand: values.brand || null,
      model: values.model || null,
      serial_no: values.serial_no || null,
      capacity: values.capacity || null,
      power_rating: values.power_rating || null,
      station: values.station || null,
      operation_instructions: values.operation_instructions || null,
      safety_notes: values.safety_notes || null,
      cleaning_instructions: values.cleaning_instructions || null,
      maintenance_schedule: values.maintenance_schedule || null,
      last_maintenance_date: values.last_maintenance_date || null,
      next_maintenance_date: values.next_maintenance_date || null,
      note: values.note || null,
      is_active: values.is_active,
      is_poolable: values.is_poolable,
      available_qty: values.available_qty,
      total_qty: values.total_qty,
      usage_count: values.usage_count,
      average_usage_time: values.average_usage_time,
    };

    if (isEdit && equipment) {
      updateEquipment.mutate(
        { id: equipment.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Equipment updated successfully");
            setMode("view");
          },
          onError: (err) =>
            toast.error(err.message || "Failed to update equipment"),
        },
      );
    } else {
      createEquipment.mutate(payload, {
        onSuccess: () => {
          toast.success("Equipment created successfully");
          setMode("view");
        },
        onError: (err) =>
          toast.error(err.message || "Failed to create equipment"),
      });
    }
  };

  const handleBack = () => router.push("/operation-plan/equipment");

  const handleEdit = () => setMode("edit");

  const handleCancel = () => {
    if (isEdit && equipment) {
      form.reset(getDefaultValues(equipment));
      setMode("view");
    } else {
      router.push("/operation-plan/equipment");
    }
  };

  const handleDelete = () => {
    if (!equipment) return;
    deleteEquipment.mutate(equipment.id, {
      onSuccess: () => {
        toast.success("Equipment deleted successfully");
        router.push("/operation-plan/equipment");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Equipment"
        mode={mode}
        formId="equipment-form"
        isPending={isPending}
        onBack={handleBack}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onDelete={equipment ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteEquipment.isPending}
      />

      <form
        id="equipment-form"
        onSubmit={form.handleSubmit(onSubmit, () =>
          toast.error("Please check the required fields"),
        )}
        className="max-w-2xl space-y-6"
      >
        {/* General Information */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">General Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.code}>
              <FieldLabel htmlFor="equipment-code" className="text-xs" required>
                Code
              </FieldLabel>
              <Input
                id="equipment-code"
                placeholder="e.g. EQ001"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={10}
                {...form.register("code")}
              />
              <FieldError>{form.formState.errors.code?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="equipment-name" className="text-xs" required>
                Name
              </FieldLabel>
              <Input
                id="equipment-name"
                placeholder="e.g. Oven"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel className="text-xs" required>
                Category
              </FieldLabel>
              <Controller
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <LookupRecipeCategory
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                  />
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-station" className="text-xs">
                Station
              </FieldLabel>
              <Input
                id="equipment-station"
                placeholder="e.g. Kitchen A"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("station")}
              />
            </Field>

            <Field className="col-span-2">
              <FieldLabel htmlFor="equipment-description" className="text-xs">
                Description
              </FieldLabel>
              <Textarea
                id="equipment-description"
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

        {/* Equipment Details */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Equipment Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="equipment-brand" className="text-xs">
                Brand
              </FieldLabel>
              <Input
                id="equipment-brand"
                placeholder="e.g. Samsung"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("brand")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-model" className="text-xs">
                Model
              </FieldLabel>
              <Input
                id="equipment-model"
                placeholder="e.g. XR-500"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("model")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-serial-no" className="text-xs">
                Serial No.
              </FieldLabel>
              <Input
                id="equipment-serial-no"
                placeholder="e.g. SN12345"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("serial_no")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-capacity" className="text-xs">
                Capacity
              </FieldLabel>
              <Input
                id="equipment-capacity"
                placeholder="e.g. 50L"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("capacity")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-power-rating" className="text-xs">
                Power Rating
              </FieldLabel>
              <Input
                id="equipment-power-rating"
                placeholder="e.g. 2000W"
                className="h-9 text-sm"
                disabled={isDisabled}
                maxLength={100}
                {...form.register("power_rating")}
              />
            </Field>
          </div>
        </div>

        {/* Quantity & Settings */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Quantity & Settings</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.available_qty}>
              <FieldLabel htmlFor="equipment-available-qty" className="text-xs">
                Available Qty
              </FieldLabel>
              <Input
                id="equipment-available-qty"
                type="number"
                min={0}
                className="h-9 text-sm"
                disabled={isDisabled}
                {...form.register("available_qty")}
              />
              <FieldError>
                {form.formState.errors.available_qty?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.total_qty}>
              <FieldLabel htmlFor="equipment-total-qty" className="text-xs">
                Total Qty
              </FieldLabel>
              <Input
                id="equipment-total-qty"
                type="number"
                min={0}
                className="h-9 text-sm"
                disabled={isDisabled}
                {...form.register("total_qty")}
              />
              <FieldError>
                {form.formState.errors.total_qty?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.usage_count}>
              <FieldLabel htmlFor="equipment-usage-count" className="text-xs">
                Usage Count
              </FieldLabel>
              <Input
                id="equipment-usage-count"
                type="number"
                min={0}
                className="h-9 text-sm"
                disabled={isDisabled}
                {...form.register("usage_count")}
              />
              <FieldError>
                {form.formState.errors.usage_count?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.average_usage_time}>
              <FieldLabel
                htmlFor="equipment-average-usage-time"
                className="text-xs"
              >
                Avg. Usage Time (min)
              </FieldLabel>
              <Input
                id="equipment-average-usage-time"
                type="number"
                min={0}
                className="h-9 text-sm"
                disabled={isDisabled}
                {...form.register("average_usage_time")}
              />
              <FieldError>
                {form.formState.errors.average_usage_time?.message}
              </FieldError>
            </Field>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Instructions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel
                htmlFor="equipment-operation-instructions"
                className="text-xs"
              >
                Operation Instructions
              </FieldLabel>
              <Textarea
                id="equipment-operation-instructions"
                placeholder="Optional"
                className="text-sm"
                rows={3}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("operation_instructions")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="equipment-safety-notes" className="text-xs">
                Safety Notes
              </FieldLabel>
              <Textarea
                id="equipment-safety-notes"
                placeholder="Optional"
                className="text-sm"
                rows={3}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("safety_notes")}
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="equipment-cleaning-instructions"
                className="text-xs"
              >
                Cleaning Instructions
              </FieldLabel>
              <Textarea
                id="equipment-cleaning-instructions"
                placeholder="Optional"
                className="text-sm"
                rows={3}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("cleaning_instructions")}
              />
            </Field>
          </div>
        </div>

        {/* Maintenance */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Maintenance</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field className="col-span-2">
              <FieldLabel
                htmlFor="equipment-maintenance-schedule"
                className="text-xs"
              >
                Maintenance Schedule
              </FieldLabel>
              <Textarea
                id="equipment-maintenance-schedule"
                placeholder="Optional"
                className="text-sm"
                rows={2}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("maintenance_schedule")}
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Last Maintenance Date</FieldLabel>
              <Controller
                control={form.control}
                name="last_maintenance_date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                    placeholder="Pick a date"
                    className="w-full"
                  />
                )}
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Next Maintenance Date</FieldLabel>
              <Controller
                control={form.control}
                name="next_maintenance_date"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                    placeholder="Pick a date"
                    className="w-full"
                  />
                )}
              />
            </Field>
          </div>
        </div>

        {/* Additional */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Additional</h2>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="equipment-note" className="text-xs">
                Note
              </FieldLabel>
              <Textarea
                id="equipment-note"
                placeholder="Optional"
                className="text-sm"
                rows={2}
                disabled={isDisabled}
                maxLength={256}
                {...form.register("note")}
              />
            </Field>

            <div className="flex gap-6">
              <Field orientation="horizontal">
                <Controller
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <Checkbox
                      id="equipment-is-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isDisabled}
                    />
                  )}
                />
                <FieldLabel htmlFor="equipment-is-active" className="text-xs">
                  Active
                </FieldLabel>
              </Field>

              <Field orientation="horizontal">
                <Controller
                  control={form.control}
                  name="is_poolable"
                  render={({ field }) => (
                    <Checkbox
                      id="equipment-is-poolable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isDisabled}
                    />
                  )}
                />
                <FieldLabel htmlFor="equipment-is-poolable" className="text-xs">
                  Poolable
                </FieldLabel>
              </Field>
            </div>
          </FieldGroup>
        </div>
      </form>

      {equipment && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteEquipment.isPending && setShowDelete(false)
          }
          title="Delete Equipment"
          description={`Are you sure you want to delete equipment "${equipment.name}"? This action cannot be undone.`}
          isPending={deleteEquipment.isPending}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
