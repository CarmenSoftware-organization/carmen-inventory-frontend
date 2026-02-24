"use client";

import { useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { toast } from "sonner";
import {
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  type CreateVendorDto,
} from "@/hooks/use-vendor";
import { useBusinessType } from "@/hooks/use-business-type";
import type { VendorDetail } from "@/types/vendor";
import type { FormMode } from "@/types/form";
import { ADDRESS_TYPE_OPTIONS } from "@/constant/vendor";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const vendorSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  is_active: z.boolean(),
  business_type_ids: z.array(z.string()),
  info: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      value: z.string(),
      data_type: z.string(),
    }),
  ),
  vendor_address: z.array(
    z.object({
      address_type: z.string().min(1, "Address type is required"),
      address_line1: z.string(),
      address_line2: z.string(),
      district: z.string(),
      province: z.string(),
      city: z.string(),
      postal_code: z.string(),
      country: z.string(),
    }),
  ),
  vendor_contact: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string(),
      phone: z.string(),
      is_primary: z.boolean(),
    }),
  ),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  readonly vendor?: VendorDetail;
}

export function VendorForm({ vendor }: VendorFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(vendor ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createVendor.isPending || updateVendor.isPending;
  const isDisabled = isView || isPending;

  const { data: btData } = useBusinessType({ perpage: -1 });
  const allBusinessTypes = btData?.data?.filter((bt) => bt.is_active) ?? [];

  const defaultValues: VendorFormValues = vendor
    ? {
        code: vendor.code,
        name: vendor.name,
        description: vendor.description ?? "",
        is_active: vendor.is_active,
        business_type_ids: vendor.business_type?.map((bt) => bt.id) ?? [],
        info: vendor.info ?? [],
        vendor_address:
          vendor.vendor_address?.map((a) => ({
            address_type: a.address_type,
            address_line1: a.address_line1 ?? "",
            address_line2: a.address_line2 ?? "",
            district: a.district ?? "",
            province: a.province ?? "",
            city: a.city ?? "",
            postal_code: a.postal_code ?? "",
            country: a.country ?? "",
          })) ?? [],
        vendor_contact:
          vendor.vendor_contact?.map((c) => ({
            name: c.name,
            email: c.email ?? "",
            phone: c.phone ?? "",
            is_primary: c.is_primary ?? false,
          })) ?? [],
      }
    : {
        code: "",
        name: "",
        description: "",
        is_active: true,
        business_type_ids: [],
        info: [],
        vendor_address: [],
        vendor_contact: [],
      };

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema) as Resolver<VendorFormValues>,
    defaultValues,
  });

  const {
    fields: infoFields,
    append: appendInfo,
    remove: removeInfo,
  } = useFieldArray({ control: form.control, name: "info" });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({ control: form.control, name: "vendor_address" });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({ control: form.control, name: "vendor_contact" });

  const watchedBtIds = useWatch({
    control: form.control,
    name: "business_type_ids",
  });
  const availableBusinessTypes = allBusinessTypes.filter(
    (bt) => !watchedBtIds.includes(bt.id),
  );

  const onSubmit = (values: VendorFormValues) => {
    const payload: CreateVendorDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      is_active: values.is_active,
      business_type: values.business_type_ids.map((id) => ({ id })),
      info: values.info,
      vendor_address: {
        add: values.vendor_address.map((a) => ({
          address_type: a.address_type,
          data: {
            address_line1: a.address_line1,
            address_line2: a.address_line2,
            district: a.district,
            province: a.province,
            city: a.city,
            postal_code: a.postal_code,
            country: a.country,
          },
        })),
      },
      vendor_contact: {
        add: values.vendor_contact.map((c) => ({
          name: c.name,
          email: c.email,
          phone: c.phone,
          is_primary: c.is_primary,
        })),
      },
    };

    if (isEdit && vendor) {
      updateVendor.mutate(
        { id: vendor.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Vendor updated successfully");
            router.push("/vendor-management/vendor");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createVendor.mutate(payload, {
        onSuccess: () => {
          toast.success("Vendor created successfully");
          router.push("/vendor-management/vendor");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && vendor) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/vendor-management/vendor");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Vendor"
        mode={mode}
        formId="vendor-form"
        isPending={isPending}
        onBack={() => router.push("/vendor-management/vendor")}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={vendor ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteVendor.isPending}
      />

      <form
        id="vendor-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="info" className="text-xs">
              Info
            </TabsTrigger>
            <TabsTrigger value="address" className="text-xs">
              Address
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: General */}
          <TabsContent value="general">
            <FieldGroup className="max-w-2xl gap-3 pt-4">
              <Field data-invalid={!!form.formState.errors.code}>
                <FieldLabel htmlFor="vendor-code" className="text-xs">
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
                <FieldLabel htmlFor="vendor-name" className="text-xs">
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
                <FieldLabel htmlFor="vendor-description" className="text-xs">
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
                <FieldLabel htmlFor="vendor-is-active" className="text-xs">
                  Active
                </FieldLabel>
              </Field>
            </FieldGroup>
          </TabsContent>

          {/* Tab 2: Info */}
          <TabsContent value="info">
            <div className="max-w-2xl space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Additional Info</span>
                {!isDisabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      appendInfo({
                        label: "",
                        value: "",
                        data_type: "string",
                      })
                    }
                  >
                    <Plus />
                    Add
                  </Button>
                )}
              </div>
              {infoFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No additional info
                </p>
              ) : (
                <div className="space-y-2">
                  {infoFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <Input
                        placeholder="Label"
                        className="h-8 text-sm flex-1"
                        disabled={isDisabled}
                        {...form.register(`info.${index}.label`)}
                      />
                      <Input
                        placeholder="Value"
                        className="h-8 text-sm flex-1"
                        disabled={isDisabled}
                        {...form.register(`info.${index}.value`)}
                      />
                      <Controller
                        control={form.control}
                        name={`info.${index}.data_type`}
                        render={({ field: dtField }) => (
                          <Select
                            value={dtField.value}
                            onValueChange={dtField.onChange}
                            disabled={isDisabled}
                          >
                            <SelectTrigger className="h-8 w-28 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {!isDisabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Remove info"
                          onClick={() => removeInfo(index)}
                        >
                          <X />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Address */}
          <TabsContent value="address">
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
                <p className="text-xs text-muted-foreground">
                  No addresses added
                </p>
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
          </TabsContent>

          {/* Tab 4: Contact */}
          <TabsContent value="contact">
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
                <p className="text-xs text-muted-foreground">
                  No contacts added
                </p>
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
          </TabsContent>
        </Tabs>
      </form>

      {vendor && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteVendor.isPending && setShowDelete(false)
          }
          title="Delete Vendor"
          description={`Are you sure you want to delete vendor "${vendor.name}"? This action cannot be undone.`}
          isPending={deleteVendor.isPending}
          onConfirm={() => {
            deleteVendor.mutate(vendor.id, {
              onSuccess: () => {
                toast.success("Vendor deleted successfully");
                router.push("/vendor-management/vendor");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Address Row                                                         */
/* ------------------------------------------------------------------ */

interface AddressRowProps {
  form: ReturnType<typeof useForm<VendorFormValues>>;
  index: number;
  isDisabled: boolean;
  onRemove: () => void;
}

const AddressRow = ({ form, index, isDisabled, onRemove }: AddressRowProps) => {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Field
          data-invalid={
            !!form.formState.errors.vendor_address?.[index]?.address_type
          }
          className="flex-1"
        >
          <FieldLabel className="text-xs">Address Type</FieldLabel>
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
          <FieldLabel className="text-xs">Address Line 1</FieldLabel>
          <Input
            placeholder="Address line 1"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.address_line1`)}
          />
        </Field>

        <Field className="col-span-2">
          <FieldLabel className="text-xs">Address Line 2</FieldLabel>
          <Input
            placeholder="Address line 2"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.address_line2`)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">District</FieldLabel>
          <Input
            placeholder="District"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.district`)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">City</FieldLabel>
          <Input
            placeholder="City"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.city`)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Province</FieldLabel>
          <Input
            placeholder="Province"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.province`)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Postal Code</FieldLabel>
          <Input
            placeholder="Postal code"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendor_address.${index}.postal_code`)}
          />
        </Field>

        <Field className="col-span-2">
          <FieldLabel className="text-xs">Country</FieldLabel>
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

/* ------------------------------------------------------------------ */
/* Contact Row                                                         */
/* ------------------------------------------------------------------ */

interface ContactRowProps {
  form: ReturnType<typeof useForm<VendorFormValues>>;
  index: number;
  isDisabled: boolean;
  onRemove: () => void;
}

const ContactRow = ({ form, index, isDisabled, onRemove }: ContactRowProps) => {
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
};
