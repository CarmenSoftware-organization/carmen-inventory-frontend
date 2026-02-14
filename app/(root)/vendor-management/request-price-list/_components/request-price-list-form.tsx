"use client";

import { useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import {
  useCreateRequestPriceList,
  useUpdateRequestPriceList,
  useDeleteRequestPriceList,
  type CreateRequestPriceListDto,
} from "@/hooks/use-request-price-list";
import { usePriceListTemplate } from "@/hooks/use-price-list-template";
import { useVendor } from "@/hooks/use-vendor";
import type { RequestPriceList } from "@/types/request-price-list";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const vendorSchema = z.object({
  vendor_id: z.string().min(1, "Vendor is required"),
  vendor_name: z.string(),
  vendor_code: z.string(),
  contact_person: z.string(),
  contact_phone: z.string(),
  contact_email: z.string(),
  dimension: z.string(),
});

const rfpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  pricelist_template_id: z
    .string()
    .min(1, "Price list template is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  custom_message: z.string(),
  vendors: z.array(vendorSchema),
});

type RfpFormValues = z.infer<typeof rfpSchema>;

function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

interface RequestPriceListFormProps {
  readonly requestPriceList?: RequestPriceList;
}

export function RequestPriceListForm({
  requestPriceList,
}: RequestPriceListFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(
    requestPriceList ? "view" : "add",
  );
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createRfp = useCreateRequestPriceList();
  const updateRfp = useUpdateRequestPriceList();
  const deleteRfp = useDeleteRequestPriceList();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createRfp.isPending || updateRfp.isPending;
  const isDisabled = isView || isPending;

  const { data: templateData } = usePriceListTemplate({ perpage: 9999 });
  const templates = templateData?.data ?? [];

  const { data: vendorData } = useVendor({ perpage: 9999 });
  const vendorList = vendorData?.data?.filter((v) => v.is_active) ?? [];

  const defaultValues: RfpFormValues = requestPriceList
    ? {
        name: requestPriceList.name,
        pricelist_template_id:
          requestPriceList.pricelist_template?.id ?? "",
        start_date: isoToDateInput(requestPriceList.start_date),
        end_date: isoToDateInput(requestPriceList.end_date),
        custom_message: requestPriceList.custom_message ?? "",
        vendors:
          requestPriceList.vendors?.map((v) => ({
            vendor_id: v.vendor_id,
            vendor_name: v.vendor_name,
            vendor_code: v.vendor_code,
            contact_person: v.contact_person ?? "",
            contact_phone: v.contact_phone ?? "",
            contact_email: v.contact_email ?? "",
            dimension: v.dimension ?? "",
          })) ?? [],
      }
    : {
        name: "",
        pricelist_template_id: "",
        start_date: "",
        end_date: "",
        custom_message: "",
        vendors: [],
      };

  const form = useForm<RfpFormValues>({
    resolver: zodResolver(rfpSchema) as Resolver<RfpFormValues>,
    defaultValues,
  });

  const {
    fields: vendorFields,
    append: appendVendor,
    remove: removeVendor,
  } = useFieldArray({ control: form.control, name: "vendors" });

  const onSubmit = (values: RfpFormValues) => {
    const payload: CreateRequestPriceListDto = {
      name: values.name,
      pricelist_template_id: values.pricelist_template_id,
      start_date: new Date(values.start_date).toISOString(),
      end_date: new Date(values.end_date).toISOString(),
      custom_message: values.custom_message,
      vendors: {
        add: values.vendors.map((v, i) => ({
          vendor_id: v.vendor_id,
          vendor_name: v.vendor_name,
          vendor_code: v.vendor_code,
          contact_person: v.contact_person,
          contact_phone: v.contact_phone,
          contact_email: v.contact_email,
          sequence_no: i + 1,
          dimension: v.dimension,
          id: "",
        })),
      },
    };

    if (isEdit && requestPriceList) {
      updateRfp.mutate(
        { id: requestPriceList.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Request price list updated successfully");
            router.push("/vendor-management/request-price-list");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createRfp.mutate(payload, {
        onSuccess: () => {
          toast.success("Request price list created successfully");
          router.push("/vendor-management/request-price-list");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && requestPriceList) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/vendor-management/request-price-list");
    }
  };

  const title = isAdd
    ? "Add Request Price List"
    : isEdit
      ? "Edit Request Price List"
      : "Request Price List";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              router.push("/vendor-management/request-price-list")
            }
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isView ? (
            <Button size="sm" onClick={() => setMode("edit")}>
              <Pencil />
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                form="request-price-list-form"
                disabled={isPending}
              >
                {isPending
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save"
                    : "Create"}
              </Button>
            </>
          )}
          {isEdit && requestPriceList && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteRfp.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="request-price-list-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="vendors" className="text-xs">
              Vendors
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: General */}
          <TabsContent value="general">
            <FieldGroup className="max-w-2xl gap-3 pt-4">
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel className="text-xs">Name</FieldLabel>
                <Input
                  placeholder="e.g. RFQ - Fresh Produce Feb 2026"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register("name")}
                />
                <FieldError>
                  {form.formState.errors.name?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.pricelist_template_id
                }
              >
                <FieldLabel className="text-xs">
                  Price List Template
                </FieldLabel>
                <Controller
                  control={form.control}
                  name="pricelist_template_id"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.pricelist_template_id?.message}
                </FieldError>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!form.formState.errors.start_date}>
                  <FieldLabel className="text-xs">Start Date</FieldLabel>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("start_date")}
                  />
                  <FieldError>
                    {form.formState.errors.start_date?.message}
                  </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.end_date}>
                  <FieldLabel className="text-xs">End Date</FieldLabel>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("end_date")}
                  />
                  <FieldError>
                    {form.formState.errors.end_date?.message}
                  </FieldError>
                </Field>
              </div>

              <Field>
                <FieldLabel className="text-xs">Custom Message</FieldLabel>
                <Textarea
                  placeholder="Optional message for vendors"
                  className="text-sm"
                  disabled={isDisabled}
                  {...form.register("custom_message")}
                />
              </Field>
            </FieldGroup>
          </TabsContent>

          {/* Tab 2: Vendors */}
          <TabsContent value="vendors">
            <div className="space-y-3 pt-4">
              {!isDisabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendVendor({
                      vendor_id: "",
                      vendor_name: "",
                      vendor_code: "",
                      contact_person: "",
                      contact_phone: "",
                      contact_email: "",
                      dimension: "",
                    })
                  }
                >
                  <Plus />
                  Add Vendor
                </Button>
              )}

              {vendorFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No vendors added
                </p>
              ) : (
                <div className="space-y-3">
                  {vendorFields.map((field, index) => (
                    <VendorRow
                      key={field.id}
                      form={form}
                      index={index}
                      isDisabled={isDisabled}
                      vendorList={vendorList}
                      onRemove={() => removeVendor(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </form>

      {requestPriceList && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteRfp.isPending && setShowDelete(false)
          }
          title="Delete Request Price List"
          description={`Are you sure you want to delete "${requestPriceList.name}"? This action cannot be undone.`}
          isPending={deleteRfp.isPending}
          onConfirm={() => {
            deleteRfp.mutate(requestPriceList.id, {
              onSuccess: () => {
                toast.success(
                  "Request price list deleted successfully",
                );
                router.push("/vendor-management/request-price-list");
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
/* Vendor Row                                                          */
/* ------------------------------------------------------------------ */

interface VendorRowProps {
  form: UseFormReturn<RfpFormValues>;
  index: number;
  isDisabled: boolean;
  vendorList: { id: string; name: string; code?: string }[];
  onRemove: () => void;
}

function VendorRow({
  form,
  index,
  isDisabled,
  vendorList,
  onRemove,
}: VendorRowProps) {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Vendor #{index + 1}
        </span>
        {!isDisabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field
          data-invalid={
            !!form.formState.errors.vendors?.[index]?.vendor_id
          }
          className="col-span-2"
        >
          <FieldLabel className="text-xs">Vendor</FieldLabel>
          <Controller
            control={form.control}
            name={`vendors.${index}.vendor_id`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  const vendor = vendorList.find((v) => v.id === value);
                  if (vendor) {
                    form.setValue(
                      `vendors.${index}.vendor_name`,
                      vendor.name,
                    );
                    form.setValue(
                      `vendors.${index}.vendor_code`,
                      vendor.code ?? "",
                    );
                  }
                }}
                disabled={isDisabled}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendorList.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>
            {form.formState.errors.vendors?.[index]?.vendor_id?.message}
          </FieldError>
        </Field>

        <Field>
          <FieldLabel className="text-xs">Contact Person</FieldLabel>
          <Input
            placeholder="e.g. John Anderson"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendors.${index}.contact_person`)}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Contact Phone</FieldLabel>
          <Input
            placeholder="e.g. 081-234-5678"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendors.${index}.contact_phone`)}
          />
        </Field>

        <Field className="col-span-2">
          <FieldLabel className="text-xs">Contact Email</FieldLabel>
          <Input
            type="email"
            placeholder="e.g. contact@vendor.com"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendors.${index}.contact_email`)}
          />
        </Field>

        <Field className="col-span-2">
          <FieldLabel className="text-xs">Dimension</FieldLabel>
          <Input
            placeholder="Optional"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`vendors.${index}.dimension`)}
          />
        </Field>
      </div>
    </div>
  );
}
