"use client";

import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, Copy, ExternalLink, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import type {
  RequestPriceList,
  RequestPriceListVendor,
  StatusRfp,
} from "@/types/request-price-list";
import { type RfpFormValues } from "./request-price-list-form-schema";

type VendorAddItem = RfpFormValues["vendors"]["add"][number];

interface VendorsTabProps {
  form: UseFormReturn<RfpFormValues>;
  isView: boolean;
  isDisabled: boolean;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  displayVendors: (RequestPriceListVendor | VendorAddItem)[];
  addedVendors: VendorAddItem[];
  selectedVendorIds: Set<string>;
  onAddVendor: (vendorId: string) => void;
  onRemoveVendor: (vendorId: string) => void;
}

export default function VendorsTab({
  form,
  isView,
  isDisabled,
  isAdding,
  setIsAdding,
  displayVendors,
  addedVendors,
  selectedVendorIds,
  onAddVendor,
  onRemoveVendor,
}: VendorsTabProps) {
  return (
    <div className="space-y-3 pt-4">
      {!isDisabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isAdding}
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      )}

      {displayVendors.length === 0 && !isAdding ? (
        <p className="text-xs text-muted-foreground">No vendors added</p>
      ) : (
        <div className="space-y-3">
          {displayVendors.map((v, index) => {
            const isExisting = "url_token" in v;
            return (
              <VendorRow
                key={
                  isExisting
                    ? (v as RequestPriceListVendor).id
                    : `add-${v.vendor_id}`
                }
                vendor={v}
                index={index}
                isView={isView}
                isDisabled={isDisabled}
                isExisting={isExisting}
                form={form}
                addedVendors={addedVendors}
                selectedVendorIds={selectedVendorIds}
                onRemove={() => onRemoveVendor(v.vendor_id)}
              />
            );
          })}

          {isAdding && (
            <div className="rounded-md border border-dashed p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  New Vendor
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setIsAdding(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-2">
                <LookupVendor
                  value=""
                  onValueChange={onAddVendor}
                  excludeIds={selectedVendorIds}
                  placeholder="Select vendor to add..."
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface VendorRowProps {
  vendor: RequestPriceListVendor | VendorAddItem;
  index: number;
  isView: boolean;
  isDisabled: boolean;
  isExisting: boolean;
  form: UseFormReturn<RfpFormValues>;
  addedVendors: VendorAddItem[];
  selectedVendorIds: Set<string>;
  onRemove: () => void;
}

function VendorRow({
  vendor,
  index,
  isView,
  isDisabled,
  isExisting,
  form,
  addedVendors,
  selectedVendorIds,
  onRemove,
}: VendorRowProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const existingVendor = isExisting ? (vendor as RequestPriceListVendor) : null;

  const addIndex = isExisting
    ? -1
    : addedVendors.findIndex((v) => v.vendor_id === vendor.vendor_id);

  const vendorPath = existingVendor?.url_token
    ? `/pl/${existingVendor.url_token}`
    : null;

  const handleCopyUrl = () => {
    if (!vendorPath) return;
    const url = `${window.location.origin}${vendorPath}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUrl = () => {
    if (!vendorPath) return;
    router.push(vendorPath);
  };

  const handleSendEmail = () => {
    if (!vendor.contact_email) return;
    window.open(`mailto:${vendor.contact_email}`, "_blank");
  };

  const updateAddField = (
    fieldIndex: number,
    field: keyof VendorAddItem,
    value: string,
  ) => {
    const currentAdd = [...(form.getValues("vendors.add") ?? [])];
    currentAdd[fieldIndex] = { ...currentAdd[fieldIndex], [field]: value };
    form.setValue("vendors.add", currentAdd);
  };

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Vendor #{index + 1}
          {vendor.vendor_name && (
            <span className="ml-1 text-foreground">{vendor.vendor_name}</span>
          )}
        </span>
        <div className="flex items-center gap-1">
          {isView && vendor.contact_email && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleSendEmail}
              title={`Send email to ${vendor.contact_email}`}
            >
              <Mail className="h-3.5 w-3.5" />
            </Button>
          )}
          {isView && existingVendor?.url_token && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleCopyUrl}
                title="Copy vendor URL"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleOpenUrl}
                title="Open vendor URL"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {!isDisabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Editable contact fields for added vendors in edit/add mode */}
      {!isExisting && addIndex >= 0 && !isView && (
        <div className="grid grid-cols-2 gap-2">
          <Field className="col-span-2">
            <FieldLabel className="text-xs">Vendor</FieldLabel>
            <LookupVendor
              value={vendor.vendor_id}
              onValueChange={(newId) => {
                if (newId === vendor.vendor_id) return;
                if (selectedVendorIds.has(newId)) {
                  toast.error("Vendor already added");
                  return;
                }
                updateAddField(addIndex, "vendor_id", newId);
              }}
              excludeIds={selectedVendorIds}
              disabled={isDisabled}
              className="w-full"
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">Contact Person</FieldLabel>
            <Input
              placeholder="e.g. John Anderson"
              className="h-8 text-sm"
              disabled={isDisabled}
              value={addedVendors[addIndex]?.contact_person ?? ""}
              onChange={(e) =>
                updateAddField(addIndex, "contact_person", e.target.value)
              }
            />
          </Field>

          <Field>
            <FieldLabel className="text-xs">Contact Phone</FieldLabel>
            <Input
              placeholder="e.g. 081-234-5678"
              className="h-8 text-sm"
              disabled={isDisabled}
              value={addedVendors[addIndex]?.contact_phone ?? ""}
              onChange={(e) =>
                updateAddField(addIndex, "contact_phone", e.target.value)
              }
            />
          </Field>

          <Field className="col-span-2">
            <FieldLabel className="text-xs">Contact Email</FieldLabel>
            <Input
              type="email"
              placeholder="e.g. contact@vendor.com"
              className="h-8 text-sm"
              disabled={isDisabled}
              value={addedVendors[addIndex]?.contact_email ?? ""}
              onChange={(e) =>
                updateAddField(addIndex, "contact_email", e.target.value)
              }
            />
          </Field>
        </div>
      )}

      {(isExisting || isView) && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {vendor.contact_person && (
            <div>
              <span className="text-muted-foreground">Contact: </span>
              {vendor.contact_person}
            </div>
          )}
          {vendor.contact_phone && (
            <div>
              <span className="text-muted-foreground">Phone: </span>
              {vendor.contact_phone}
            </div>
          )}
          {vendor.contact_email && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Email: </span>
              {vendor.contact_email}
            </div>
          )}
          {existingVendor?.has_submitted !== undefined && (
            <div className="col-span-2 mt-1">
              <Badge
                size="xs"
                variant={existingVendor.has_submitted ? "success" : "outline"}
              >
                {existingVendor.has_submitted ? "Submitted" : "Pending"}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
