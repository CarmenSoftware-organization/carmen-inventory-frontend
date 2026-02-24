import { Controller, useFieldArray, useForm } from "react-hook-form";
import { VendorFormValues } from "./vendor-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface VendorContactTabProps {
  form: ReturnType<typeof useForm<VendorFormValues>>;
  isDisabled: boolean;
  contactFields: ReturnType<
    typeof useFieldArray<VendorFormValues, "vendor_contact">
  >["fields"];
  appendContact: ReturnType<
    typeof useFieldArray<VendorFormValues, "vendor_contact">
  >["append"];
  removeContact: ReturnType<
    typeof useFieldArray<VendorFormValues, "vendor_contact">
  >["remove"];
}

export function VendorContactTab({
  form,
  isDisabled,
  contactFields,
  appendContact,
  removeContact,
}: VendorContactTabProps) {
  return (
    <div className="max-w-2xl space-y-3 pt-4">
      {!isDisabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendContact({
              name: "",
              email: "",
              phone: "",
              is_primary: false,
            })
          }
        >
          <Plus />
          Add Contact
        </Button>
      )}

      {contactFields.length === 0 ? (
        <p className="text-xs text-muted-foreground">No contacts added</p>
      ) : (
        <div className="space-y-3">
          {contactFields.map((field, index) => (
            <ContactRow
              key={field.id}
              form={form}
              index={index}
              isDisabled={isDisabled}
              onRemove={() => removeContact(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ContactRowProps {
  form: ReturnType<typeof useForm<VendorFormValues>>;
  index: number;
  isDisabled: boolean;
  onRemove: () => void;
}

function ContactRow({
  form,
  index,
  isDisabled,
  onRemove,
}: ContactRowProps) {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Field
          data-invalid={!!form.formState.errors.vendor_contact?.[index]?.name}
        >
          <FieldLabel className="text-xs">Name</FieldLabel>
          <Input
            placeholder="Contact name"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_contact.${index}.name`)}
          />
          <FieldError>
            {form.formState.errors.vendor_contact?.[index]?.name?.message}
          </FieldError>
        </Field>

        <Field>
          <FieldLabel className="text-xs">Email</FieldLabel>
          <Input
            type="email"
            placeholder="email@example.com"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_contact.${index}.email`)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Phone</FieldLabel>
          <Input
            placeholder="Phone number"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_contact.${index}.phone`)}
          />
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <Field orientation="horizontal">
          <Controller
            control={form.control}
            name={`vendor_contact.${index}.is_primary`}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
          <FieldLabel className="text-xs">Primary Contact</FieldLabel>
        </Field>

        {!isDisabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="ml-auto"
            aria-label="Remove contact"
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
