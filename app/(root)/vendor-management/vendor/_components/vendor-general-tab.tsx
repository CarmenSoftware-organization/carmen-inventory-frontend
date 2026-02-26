import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";
import { VendorFormValues } from "./vendor-form";
import type { BusinessType } from "@/types/business-type";

interface VendorGeneralTabProps {
  form: ReturnType<typeof useForm<VendorFormValues>>;
  isDisabled: boolean;
  availableBusinessTypes: BusinessType[];
  allBusinessTypes: BusinessType[];
  watchedBtIds: string[];
}

export function VendorGeneralTab({
  form,
  isDisabled,
  availableBusinessTypes,
  allBusinessTypes,
  watchedBtIds,
}: VendorGeneralTabProps) {
  return (
    <FieldGroup className="max-w-2xl gap-3 pt-4">
      <Field data-invalid={!!form.formState.errors.code}>
        <FieldLabel htmlFor="vendor-code">
          Code
        </FieldLabel>
        <Input
          id="vendor-code"
          placeholder="e.g. VN-001"
          className="h-8 text-sm"
          disabled={isDisabled}
          maxLength={10}
          {...form.register("code")}
        />
        <FieldError>{form.formState.errors.code?.message}</FieldError>
      </Field>

      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel htmlFor="vendor-name">
          Name
        </FieldLabel>
        <Input
          id="vendor-name"
          placeholder="e.g. บริษัท ABC จำกัด"
          className="h-8 text-sm"
          disabled={isDisabled}
          maxLength={100}
          {...form.register("name")}
        />
        <FieldError>{form.formState.errors.name?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="vendor-description">
          Description
        </FieldLabel>
        <Textarea
          id="vendor-description"
          placeholder="Optional"
          className="text-sm"
          disabled={isDisabled}
          maxLength={256}
          {...form.register("description")}
        />
      </Field>

      {/* Business Type — Select + Add/Remove */}
      <div className="space-y-2">
        <span className="text-xs font-medium">Business Type</span>
        {!isDisabled && availableBusinessTypes.length > 0 && (
          <Select
            onValueChange={(btId) => {
              const current = form.getValues("business_type_ids");
              if (!current.includes(btId)) {
                form.setValue("business_type_ids", [...current, btId]);
              }
            }}
          >
            <SelectTrigger className="h-8 w-full text-sm">
              <SelectValue placeholder="Add business type..." />
            </SelectTrigger>
            <SelectContent>
              {availableBusinessTypes.map((bt) => (
                <SelectItem key={bt.id} value={bt.id}>
                  {bt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {watchedBtIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No business types assigned
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {watchedBtIds.map((btId) => {
              const bt = allBusinessTypes.find((b) => b.id === btId);
              return (
                <span
                  key={btId}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
                >
                  {bt?.name ?? btId}
                  {!isDisabled && (
                    <button
                      type="button"
                      className="hover:text-destructive"
                      aria-label={`Remove ${bt?.name ?? "business type"}`}
                      onClick={() =>
                        form.setValue(
                          "business_type_ids",
                          watchedBtIds.filter((id) => id !== btId),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <Field orientation="horizontal">
        <Controller
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <Checkbox
              id="vendor-is-active"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isDisabled}
            />
          )}
        />
        <FieldLabel htmlFor="vendor-is-active">
          Active
        </FieldLabel>
      </Field>
    </FieldGroup>
  );
}
