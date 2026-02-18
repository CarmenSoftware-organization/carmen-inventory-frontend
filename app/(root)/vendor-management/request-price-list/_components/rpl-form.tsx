"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  useCreateRequestPriceList,
  useUpdateRequestPriceList,
  useDeleteRequestPriceList,
  type CreateRequestPriceListDto,
} from "@/hooks/use-request-price-list";
import { useVendor } from "@/hooks/use-vendor";
import type {
  RequestPriceList,
  RequestPriceListVendor,
  StatusRfp,
} from "@/types/request-price-list";
import type { FormMode } from "@/types/form";
import {
  rfpSchema,
  type RfpFormValues,
  getDefaultValues,
} from "./rpl-form-schema";
import { RequestPriceListGeneralFields } from "./rpl-general-fields";
import RplVendorsTab from "./rpl-vendor-tab";

const statusVariantMap: Record<
  StatusRfp,
  "outline" | "success" | "info" | "destructive" | "secondary"
> = {
  draft: "outline",
  active: "success",
  submit: "info",
  completed: "success",
  inactive: "destructive",
};

const statusLabelMap: Record<StatusRfp, string> = {
  draft: "Draft",
  active: "Active",
  submit: "Submit",
  completed: "Completed",
  inactive: "Inactive",
};

type VendorAddItem = RfpFormValues["vendors"]["add"][number];

interface RequestPriceListFormProps {
  readonly requestPriceList?: RequestPriceList;
}

export function RequestPriceListForm({
  requestPriceList,
}: RequestPriceListFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(requestPriceList ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createRfp = useCreateRequestPriceList();
  const updateRfp = useUpdateRequestPriceList();
  const deleteRfp = useDeleteRequestPriceList();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createRfp.isPending || updateRfp.isPending;
  const isDisabled = isView || isPending;

  const { data: vendorData } = useVendor({ perpage: -1 });
  const vendorList = useMemo(
    () => vendorData?.data?.filter((v) => v.is_active) ?? [],
    [vendorData?.data],
  );

  const form = useForm<RfpFormValues>({
    resolver: zodResolver(rfpSchema) as Resolver<RfpFormValues>,
    defaultValues: getDefaultValues(requestPriceList),
  });

  useEffect(() => {
    if (requestPriceList) {
      form.reset(getDefaultValues(requestPriceList));
    }
  }, [requestPriceList, form]);

  const [isAdding, setIsAdding] = useState(false);

  const watchedAdd = useWatch({ control: form.control, name: "vendors.add" });
  const addedVendors: VendorAddItem[] = useMemo(
    () => watchedAdd ?? [],
    [watchedAdd],
  );

  const removedIds = useWatch({
    control: form.control,
    name: "vendors.remove",
  });
  const removedVendorIds = useMemo(
    () => new Set(removedIds ?? []),
    [removedIds],
  );

  const existingVendors = useMemo(
    () =>
      (requestPriceList?.vendors ?? []).filter(
        (v) => !removedVendorIds.has(v.vendor_id),
      ),
    [requestPriceList?.vendors, removedVendorIds],
  );

  const displayVendors: (RequestPriceListVendor | VendorAddItem)[] = useMemo(
    () => [...existingVendors, ...addedVendors],
    [existingVendors, addedVendors],
  );

  const selectedVendorIds = useMemo(
    () =>
      new Set([
        ...existingVendors.map((v) => v.vendor_id),
        ...addedVendors.map((v) => v.vendor_id),
      ]),
    [existingVendors, addedVendors],
  );

  const handleAddVendor = useCallback(
    (vendorId: string) => {
      if (selectedVendorIds.has(vendorId)) {
        toast.error("Vendor already added");
        setIsAdding(false);
        return;
      }

      const vendor = vendorList.find((v) => v.id === vendorId);
      if (!vendor) return;

      const currentAdd = form.getValues("vendors.add") ?? [];
      form.setValue("vendors.add", [
        ...currentAdd,
        {
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          vendor_code: (vendor as unknown as { code?: string }).code ?? "",
          contact_person: "",
          contact_phone: "",
          contact_email: "",
          dimension: "",
        },
      ]);
      setIsAdding(false);
    },
    [selectedVendorIds, vendorList, form],
  );

  const handleRemoveVendor = useCallback(
    (vendorId: string) => {
      const currentAdd = form.getValues("vendors.add") ?? [];
      const addIndex = currentAdd.findIndex((v) => v.vendor_id === vendorId);

      if (addIndex >= 0) {
        const updated = [...currentAdd];
        updated.splice(addIndex, 1);
        form.setValue("vendors.add", updated);
      } else {
        const currentRemove = form.getValues("vendors.remove") ?? [];
        form.setValue("vendors.remove", [...currentRemove, vendorId]);
      }
    },
    [form],
  );

  const onSubmit = (values: RfpFormValues) => {
    const vendorsAdd = (values.vendors?.add ?? []).map((v, i) => ({
      vendor_id: v.vendor_id,
      vendor_name: v.vendor_name,
      vendor_code: v.vendor_code,
      contact_person: v.contact_person,
      contact_phone: v.contact_phone,
      contact_email: v.contact_email,
      sequence_no: existingVendors.length + i + 1,
      dimension: v.dimension,
      id: "",
    }));

    const vendorsRemove = values.vendors?.remove ?? [];

    const payload: CreateRequestPriceListDto = {
      name: values.name,
      status: values.status,
      pricelist_template_id: values.pricelist_template_id || undefined,
      start_date: values.start_date,
      end_date: values.end_date,
      custom_message: values.custom_message ?? "",
      email_template_id: values.email_template_id || undefined,
      info: values.info || undefined,
      dimension: values.dimension || undefined,
      vendors: {
        add: vendorsAdd.length > 0 ? vendorsAdd : undefined,
        remove: vendorsRemove.length > 0 ? vendorsRemove : undefined,
      },
    };

    if (isEdit && requestPriceList) {
      updateRfp.mutate(
        { id: requestPriceList.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Request price list updated successfully");
            setMode("view");
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
      form.reset(getDefaultValues(requestPriceList));
      setIsAdding(false);
      setMode("view");
    } else {
      router.push("/vendor-management/request-price-list");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Request Price List"
        mode={mode}
        formId="request-price-list-form"
        isPending={isPending}
        onBack={() => router.push("/vendor-management/request-price-list")}
        onCancel={handleCancel}
        onEdit={() => setMode("edit")}
        onDelete={requestPriceList ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteRfp.isPending}
      />
      {isView && requestPriceList?.status && (
        <Badge
          size="sm"
          variant={statusVariantMap[requestPriceList.status] ?? "outline"}
        >
          {statusLabelMap[requestPriceList.status] ?? requestPriceList.status}
        </Badge>
      )}

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
              {displayVendors.length > 0 && (
                <span className="ml-1 inline-flex h-4.5 min-w-5 items-center justify-center rounded bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {displayVendors.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <RequestPriceListGeneralFields form={form} disabled={isDisabled} />
          </TabsContent>

          <TabsContent value="vendors">
            <RplVendorsTab
              form={form}
              isDisabled={isDisabled}
              isAdding={isAdding}
              setIsAdding={setIsAdding}
              displayVendors={displayVendors}
              addedVendors={addedVendors}
              selectedVendorIds={selectedVendorIds}
              onAddVendor={handleAddVendor}
              onRemoveVendor={handleRemoveVendor}
            />
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
                toast.success("Request price list deleted successfully");
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
