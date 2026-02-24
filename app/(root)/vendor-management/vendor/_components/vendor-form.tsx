"use client";

import { useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { VendorAddressTab } from "./vendor-address-row";
import { VendorContactTab } from "./vendor-contact-row";
import { VendorGeneralTab } from "./vendor-general-tab";
import { VendorInfoTab } from "./vendor-info-tab";

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

export type VendorFormValues = z.infer<typeof vendorSchema>;

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

          <TabsContent value="general">
            <VendorGeneralTab
              form={form}
              isDisabled={isDisabled}
              availableBusinessTypes={availableBusinessTypes}
              allBusinessTypes={allBusinessTypes}
              watchedBtIds={watchedBtIds}
            />
          </TabsContent>

          <TabsContent value="info">
            <VendorInfoTab
              form={form}
              isDisabled={isDisabled}
              infoFields={infoFields}
              appendInfo={appendInfo}
              removeInfo={removeInfo}
            />
          </TabsContent>

          <TabsContent value="address">
            <VendorAddressTab
              form={form}
              isDisabled={isDisabled}
              addressFields={addressFields}
              appendAddress={appendAddress}
              removeAddress={removeAddress}
            />
          </TabsContent>

          <TabsContent value="contact">
            <VendorContactTab
              form={form}
              isDisabled={isDisabled}
              contactFields={contactFields}
              appendContact={appendContact}
              removeContact={removeContact}
            />
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
