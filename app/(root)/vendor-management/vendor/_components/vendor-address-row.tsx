import { Controller, useFieldArray, useForm } from "react-hook-form";
import { VendorFormValues } from "./vendor-form";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ADDRESS_TYPE_OPTIONS } from "@/constant/vendor";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface VendorAddressTabProps {
  form: ReturnType<typeof useForm<VendorFormValues>>;
  isDisabled: boolean;
  addressFields: ReturnType<
    typeof useFieldArray<VendorFormValues, "vendor_address">
  >["fields"];
  appendAddress: ReturnType<
    typeof useFieldArray<VendorFormValues, "vendor_address">
  >["append"];
  removeAddress: ReturnType<
    typeof useFieldArray<VendorFormValues, "vendor_address">
  >["remove"];
}

export function VendorAddressTab({
  form,
  isDisabled,
  addressFields,
  appendAddress,
  removeAddress,
}: VendorAddressTabProps) {
  return (
    <div className="max-w-2xl space-y-3 pt-4">
      {!isDisabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendAddress({
              address_type: "",
              address_line1: "",
              address_line2: "",
              district: "",
              province: "",
              city: "",
              postal_code: "",
              country: "",
            })
          }
        >
          <Plus />
          Add Address
        </Button>
      )}

      {addressFields.length === 0 ? (
        <p className="text-xs text-muted-foreground">No addresses added</p>
      ) : (
        <div className="space-y-3">
          {addressFields.map((field, index) => (
            <AddressRow
              key={field.id}
              form={form}
              index={index}
              isDisabled={isDisabled}
              onRemove={() => removeAddress(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AddressRowProps {
  form: ReturnType<typeof useForm<VendorFormValues>>;
  index: number;
  isDisabled: boolean;
  onRemove: () => void;
}

const AddressRow = ({
  form,
  index,
  isDisabled,
  onRemove,
}: AddressRowProps) => {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Field
          data-invalid={
            !!form.formState.errors.vendor_address?.[index]?.address_type
          }
          className="flex-1"
        >
          <FieldLabel>Address Type</FieldLabel>
          <Controller
            control={form.control}
            name={`vendor_address.${index}.address_type`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isDisabled}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ADDRESS_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        {!isDisabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="ml-2 mt-5"
            aria-label="Remove address"
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field className="col-span-2">
          <FieldLabel>Address Line 1</FieldLabel>
          <Input
            placeholder="Address line 1"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.address_line1`)}
          />
        </Field>

        <Field className="col-span-2">
          <FieldLabel>Address Line 2</FieldLabel>
          <Input
            placeholder="Address line 2"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.address_line2`)}
          />
        </Field>

        <Field>
          <FieldLabel>District</FieldLabel>
          <Input
            placeholder="District"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.district`)}
          />
        </Field>

        <Field>
          <FieldLabel>City</FieldLabel>
          <Input
            placeholder="City"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.city`)}
          />
        </Field>

        <Field>
          <FieldLabel>Province</FieldLabel>
          <Input
            placeholder="Province"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.province`)}
          />
        </Field>

        <Field>
          <FieldLabel>Postal Code</FieldLabel>
          <Input
            placeholder="Postal code"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.postal_code`)}
          />
        </Field>

        <Field className="col-span-2">
          <FieldLabel>Country</FieldLabel>
          <Input
            placeholder="Country"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.country`)}
          />
        </Field>
      </div>
    </div>
  );
};
