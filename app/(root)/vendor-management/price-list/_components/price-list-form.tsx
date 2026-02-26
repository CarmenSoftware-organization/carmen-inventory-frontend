"use client";

import { useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormToolbar } from "@/components/ui/form-toolbar";
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
  useCreatePriceList,
  useUpdatePriceList,
  useDeletePriceList,
  type CreatePriceListDto,
} from "@/hooks/use-price-list";
import { useVendor } from "@/hooks/use-vendor";
import { useCurrency } from "@/hooks/use-currency";
import { useProduct } from "@/hooks/use-product";
import { useTaxProfile } from "@/hooks/use-tax-profile";
import { LookupUnit } from "@/components/lookup/lookup-unit";
import type { PriceList } from "@/types/price-list";
import type { FormMode } from "@/types/form";
import { PRICE_LIST_STATUS_OPTIONS } from "@/constant/price-list";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const priceListDetailSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  unit_id: z.string().min(1, "Unit is required"),
  moq_qty: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  price_without_tax: z.coerce.number().min(0),
  tax_profile_id: z.string(),
  tax_rate: z.coerce.number().min(0),
  tax_amt: z.coerce.number().min(0),
  lead_time_days: z.coerce.number().min(0),
});

const priceListSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  status: z.enum(["draft", "active", "inactive"]),
  vendor_id: z.string().min(1, "Vendor is required"),
  currency_id: z.string().min(1, "Currency is required"),
  effective_from_date: z.string().min(1, "Start date is required"),
  effective_to_date: z.string().min(1, "End date is required"),
  note: z.string(),
  pricelist_detail: z.array(priceListDetailSchema),
});

type PriceListFormValues = z.infer<typeof priceListSchema>;

const parseEffectivePeriod = (period: string): { from: string; to: string } => {
  const parts = period.split(" - ");
  if (parts.length !== 2) return { from: "", to: "" };
  const fromDate = new Date(parts[0].trim());
  const toDate = new Date(parts[1].trim());
  const fmt = (d: Date) => {
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };
  return { from: fmt(fromDate), to: fmt(toDate) };
};

interface PriceListFormProps {
  readonly priceList?: PriceList;
}

export function PriceListForm({ priceList }: PriceListFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(priceList ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createPriceList = useCreatePriceList();
  const updatePriceList = useUpdatePriceList();
  const deletePriceList = useDeletePriceList();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createPriceList.isPending || updatePriceList.isPending;
  const isDisabled = isView || isPending;

  const { data: vendorData } = useVendor({ perpage: -1 });
  const vendors = vendorData?.data?.filter((v) => v.is_active) ?? [];

  const { data: currencyData } = useCurrency({ perpage: -1 });
  const currencies = currencyData?.data?.filter((c) => c.is_active) ?? [];

  const { data: productData } = useProduct({ perpage: -1 });
  const products = productData?.data ?? [];

  const { data: taxProfileData } = useTaxProfile({ perpage: -1 });
  const taxProfiles = taxProfileData?.data?.filter((tp) => tp.is_active) ?? [];

  const dates = priceList
    ? parseEffectivePeriod(priceList.effectivePeriod)
    : { from: "", to: "" };

  const defaultValues: PriceListFormValues = priceList
    ? {
        name: priceList.name,
        description: priceList.description ?? "",
        status: priceList.status,
        vendor_id: priceList.vendor?.id ?? "",
        currency_id: priceList.currency?.id ?? "",
        effective_from_date: dates.from,
        effective_to_date: dates.to,
        note: priceList.note ?? "",
        pricelist_detail:
          priceList.pricelist_detail?.map((d) => ({
            product_id: d.product_id,
            unit_id: d.unit_id,
            moq_qty: d.moq_qty,
            price: d.price,
            price_without_tax: d.price_wirhout_tax,
            tax_profile_id: d.tax_profile_id ?? "",
            tax_rate: d.tax_profile?.rate ?? 0,
            tax_amt: d.tax_amt,
            lead_time_days: d.lead_time_days,
          })) ?? [],
      }
    : {
        name: "",
        description: "",
        status: "draft",
        vendor_id: "",
        currency_id: "",
        effective_from_date: "",
        effective_to_date: "",
        note: "",
        pricelist_detail: [],
      };

  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(priceListSchema) as Resolver<PriceListFormValues>,
    defaultValues,
  });

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({ control: form.control, name: "pricelist_detail" });

  const onSubmit = (values: PriceListFormValues) => {
    const payload: CreatePriceListDto = {
      vendor_id: values.vendor_id,
      name: values.name,
      description: values.description,
      status: values.status,
      currency_id: values.currency_id,
      effective_from_date: new Date(values.effective_from_date).toISOString(),
      effective_to_date: new Date(values.effective_to_date).toISOString(),
      note: values.note,
      pricelist_detail: {
        add: values.pricelist_detail.map((d, i) => ({
          sequence_no: i + 1,
          product_id: d.product_id,
          price: d.price,
          price_without_tax: d.price_without_tax,
          unit_id: d.unit_id,
          tax_profile_id: d.tax_profile_id || "",
          tax_rate: d.tax_rate,
          tax_amt: d.tax_amt,
          lead_time_days: d.lead_time_days,
          moq_qty: d.moq_qty,
        })),
      },
    };

    if (isEdit && priceList) {
      updatePriceList.mutate(
        { id: priceList.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Price list updated successfully");
            router.push("/vendor-management/price-list");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createPriceList.mutate(payload, {
        onSuccess: () => {
          toast.success("Price list created successfully");
          router.push("/vendor-management/price-list");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && priceList) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/vendor-management/price-list");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Price List"
        mode={mode}
        formId="price-list-form"
        isPending={isPending}
        onBack={() => router.push("/vendor-management/price-list")}
        onCancel={handleCancel}
        onEdit={() => setMode("edit")}
        onDelete={() => setShowDelete(true)}
        deleteIsPending={deletePriceList.isPending}
      />

      <form
        id="price-list-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="detail" className="text-xs">
              Detail
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: General */}
          <TabsContent value="general">
            <FieldGroup className="max-w-2xl gap-3 pt-4">
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel>Name</FieldLabel>
                <Input
                  placeholder="e.g. Quotation - Fresh Produce"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  maxLength={100}
                  {...form.register("name")}
                />
                <FieldError>{form.formState.errors.name?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  placeholder="Optional"
                  className="text-sm"
                  disabled={isDisabled}
                  maxLength={256}
                  {...form.register("description")}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.status}>
                <FieldLabel>Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_LIST_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.vendor_id}>
                <FieldLabel>Vendor</FieldLabel>
                <Controller
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.vendor_id?.message}
                </FieldError>
              </Field>

              <Field data-invalid={!!form.formState.errors.currency_id}>
                <FieldLabel>Currency</FieldLabel>
                <Controller
                  control={form.control}
                  name="currency_id"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-8 w-full text-sm">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.currency_id?.message}
                </FieldError>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  data-invalid={!!form.formState.errors.effective_from_date}
                >
                  <FieldLabel>Effective From</FieldLabel>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("effective_from_date")}
                  />
                  <FieldError>
                    {form.formState.errors.effective_from_date?.message}
                  </FieldError>
                </Field>

                <Field data-invalid={!!form.formState.errors.effective_to_date}>
                  <FieldLabel>Effective To</FieldLabel>
                  <Input
                    type="date"
                    className="h-8 text-sm"
                    disabled={isDisabled}
                    {...form.register("effective_to_date")}
                  />
                  <FieldError>
                    {form.formState.errors.effective_to_date?.message}
                  </FieldError>
                </Field>
              </div>

              <Field>
                <FieldLabel>Note</FieldLabel>
                <Textarea
                  placeholder="Optional"
                  className="text-sm"
                  disabled={isDisabled}
                  maxLength={256}
                  {...form.register("note")}
                />
              </Field>
            </FieldGroup>
          </TabsContent>

          {/* Tab 2: Detail */}
          <TabsContent value="detail">
            <div className="space-y-3 pt-4">
              {!isDisabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendDetail({
                      product_id: "",
                      unit_id: "",
                      moq_qty: 1,
                      price: 0,
                      price_without_tax: 0,
                      tax_profile_id: "",
                      tax_rate: 0,
                      tax_amt: 0,
                      lead_time_days: 0,
                    })
                  }
                >
                  <Plus />
                  Add Detail
                </Button>
              )}

              {detailFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No detail items added
                </p>
              ) : (
                <div className="space-y-3">
                  {detailFields.map((field, index) => (
                    <DetailRow
                      key={field.id}
                      form={form}
                      index={index}
                      isDisabled={isDisabled}
                      products={products}
                      taxProfiles={taxProfiles}
                      onRemove={() => removeDetail(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </form>

      {priceList && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deletePriceList.isPending && setShowDelete(false)
          }
          title="Delete Price List"
          description={`Are you sure you want to delete price list "${priceList.name}"? This action cannot be undone.`}
          isPending={deletePriceList.isPending}
          onConfirm={() => {
            deletePriceList.mutate(priceList.id, {
              onSuccess: () => {
                toast.success("Price list deleted successfully");
                router.push("/vendor-management/price-list");
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
/* Detail Row                                                          */
/* ------------------------------------------------------------------ */

interface DetailRowProps {
  form: ReturnType<typeof useForm<PriceListFormValues>>;
  index: number;
  isDisabled: boolean;
  products: { id: string; name: string }[];
  taxProfiles: { id: string; name: string; tax_rate?: number }[];
  onRemove: () => void;
}

const DetailRow = ({
  form,
  index,
  isDisabled,
  products,
  taxProfiles,
  onRemove,
}: DetailRowProps) => {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          #{index + 1}
        </span>
        {!isDisabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Remove item"
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field
          data-invalid={
            !!form.formState.errors.pricelist_detail?.[index]?.product_id
          }
          className="col-span-2"
        >
          <FieldLabel>Product</FieldLabel>
          <Controller
            control={form.control}
            name={`pricelist_detail.${index}.product_id`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isDisabled}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>
            {
              form.formState.errors.pricelist_detail?.[index]?.product_id
                ?.message
            }
          </FieldError>
        </Field>

        <Field
          data-invalid={
            !!form.formState.errors.pricelist_detail?.[index]?.unit_id
          }
        >
          <FieldLabel>Unit</FieldLabel>
          <Controller
            control={form.control}
            name={`pricelist_detail.${index}.unit_id`}
            render={({ field }) => (
              <LookupUnit
                value={field.value}
                onValueChange={field.onChange}
                disabled={isDisabled}
                className="h-8 w-full text-sm"
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel>MOQ Qty</FieldLabel>
          <Input
            type="number"
            min={0}
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`pricelist_detail.${index}.moq_qty`)}
          />
        </Field>

        <Field>
          <FieldLabel>Price</FieldLabel>
          <Input
            type="number"
            min={0}
            step="any"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`pricelist_detail.${index}.price`)}
          />
        </Field>

        <Field>
          <FieldLabel>Price Without Tax</FieldLabel>
          <Input
            type="number"
            min={0}
            step="any"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`pricelist_detail.${index}.price_without_tax`)}
          />
        </Field>

        <Field>
          <FieldLabel>Tax Profile</FieldLabel>
          <Controller
            control={form.control}
            name={`pricelist_detail.${index}.tax_profile_id`}
            render={({ field }) => (
              <Select
                value={field.value || "none"}
                onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                disabled={isDisabled}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Select tax profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {taxProfiles.map((tp) => (
                    <SelectItem key={tp.id} value={tp.id}>
                      {tp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field>
          <FieldLabel>Tax Rate</FieldLabel>
          <Input
            type="number"
            min={0}
            step="any"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`pricelist_detail.${index}.tax_rate`)}
          />
        </Field>

        <Field>
          <FieldLabel>Tax Amount</FieldLabel>
          <Input
            type="number"
            min={0}
            step="any"
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`pricelist_detail.${index}.tax_amt`)}
          />
        </Field>

        <Field>
          <FieldLabel>Lead Time (days)</FieldLabel>
          <Input
            type="number"
            min={0}
            className="h-8 text-sm"
            disabled={isDisabled}
            {...form.register(`pricelist_detail.${index}.lead_time_days`)}
          />
        </Field>
      </div>
    </div>
  );
};
