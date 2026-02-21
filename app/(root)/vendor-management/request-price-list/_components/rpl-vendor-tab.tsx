"use no memo";

import { useState, useMemo, useCallback } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Plus,
  Trash2,
  X,
  Copy,
  ExternalLink,
  Check,
  Mail,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { LookupVendor } from "@/components/lookup/lookup-vendor";
import type { RequestPriceListVendor } from "@/types/request-price-list";
import { type RfpFormValues } from "./rpl-form-schema";
import EmptyComponent from "@/components/empty-component";

type VendorAddItem = RfpFormValues["vendors"]["add"][number];
type DisplayVendor = RequestPriceListVendor | VendorAddItem;

const NEW_ROW_ID = "__new__";

interface VendorsTabProps {
  form: UseFormReturn<RfpFormValues>;
  isDisabled: boolean;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  displayVendors: DisplayVendor[];
  addedVendors: VendorAddItem[];
  selectedVendorIds: Set<string>;
  onAddVendor: (vendorId: string) => void;
  onRemoveVendor: (vendorId: string) => void;
}

export default function RplVendorsTab({
  form,
  isDisabled,
  isAdding,
  setIsAdding,
  displayVendors,
  addedVendors,
  selectedVendorIds,
  onAddVendor,
  onRemoveVendor,
}: VendorsTabProps) {
  const router = useRouter();

  const updateAddField = useCallback(
    (fieldIndex: number, field: keyof VendorAddItem, value: string) => {
      const currentAdd = [...(form.getValues("vendors.add") ?? [])];
      currentAdd[fieldIndex] = { ...currentAdd[fieldIndex], [field]: value };
      form.setValue("vendors.add", currentAdd);
    },
    [form],
  );

  const tableData = useMemo<DisplayVendor[]>(() => {
    if (!isAdding) return displayVendors;
    const placeholder: VendorAddItem = {
      vendor_id: NEW_ROW_ID,
      vendor_name: "",
      vendor_code: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      dimension: "",
    };
    return [...displayVendors, placeholder];
  }, [displayVendors, isAdding]);

  const columns = useMemo<ColumnDef<DisplayVendor>[]>(() => {
    const isNewRow = (v: DisplayVendor) => v.vendor_id === NEW_ROW_ID;

    const indexCol: ColumnDef<DisplayVendor> = {
      id: "index",
      header: "#",
      cell: ({ row }) => {
        if (isNewRow(row.original)) return null;
        return row.index + 1;
      },
      enableSorting: false,
      size: 32,
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    };

    const vendorNameCol: ColumnDef<DisplayVendor> = {
      accessorKey: "vendor_name",
      header: "Vendor",
      cell: ({ row }) => {
        const v = row.original;
        const isExisting = "url_token" in v;
        const addIdx = isExisting
          ? -1
          : addedVendors.findIndex((a) => a.vendor_id === v.vendor_id);

        return (
          <LookupVendor
            value={v.vendor_id === NEW_ROW_ID ? "" : v.vendor_id}
            defaultLabel={v.vendor_name || undefined}
            disabled={isDisabled}
            onValueChange={(newId) => {
              if (isNewRow(v)) {
                onAddVendor(newId);
                return;
              }
              if (newId === v.vendor_id) return;
              if (selectedVendorIds.has(newId)) {
                toast.error("Vendor already added");
                return;
              }
              if (addIdx >= 0) updateAddField(addIdx, "vendor_id", newId);
            }}
            excludeIds={selectedVendorIds}
            placeholder={isNewRow(v) ? "Select vendor to add..." : undefined}
            className="w-full text-xs h-7"
          />
        );
      },
      size: 180,
    };

    const contactPersonCol: ColumnDef<DisplayVendor> = {
      accessorKey: "contact_person",
      header: "Contact Person",
      cell: ({ row }) => {
        const v = row.original;
        if (isNewRow(v)) return null;
        const isExisting = "url_token" in v;
        const addIdx = isExisting
          ? -1
          : addedVendors.findIndex((a) => a.vendor_id === v.vendor_id);
        return (
          <Input
            placeholder="e.g. John"
            className="h-7 text-xs"
            disabled={isDisabled}
            value={
              addIdx >= 0
                ? (addedVendors[addIdx]?.contact_person ?? "")
                : v.contact_person
            }
            onChange={(e) => {
              if (addIdx >= 0)
                updateAddField(addIdx, "contact_person", e.target.value);
            }}
          />
        );
      },
      size: 140,
    };

    const contactPhoneCol: ColumnDef<DisplayVendor> = {
      accessorKey: "contact_phone",
      header: "Phone",
      cell: ({ row }) => {
        const v = row.original;
        if (isNewRow(v)) return null;
        const isExisting = "url_token" in v;
        const addIdx = isExisting
          ? -1
          : addedVendors.findIndex((a) => a.vendor_id === v.vendor_id);
        return (
          <Input
            placeholder="e.g. 081-234-5678"
            className="h-7 text-xs"
            disabled={isDisabled}
            value={
              addIdx >= 0
                ? (addedVendors[addIdx]?.contact_phone ?? "")
                : v.contact_phone
            }
            onChange={(e) => {
              if (addIdx >= 0)
                updateAddField(addIdx, "contact_phone", e.target.value);
            }}
          />
        );
      },
      size: 130,
    };

    const contactEmailCol: ColumnDef<DisplayVendor> = {
      accessorKey: "contact_email",
      header: "Email",
      cell: ({ row }) => {
        const v = row.original;
        if (isNewRow(v)) return null;
        const isExisting = "url_token" in v;
        const addIdx = isExisting
          ? -1
          : addedVendors.findIndex((a) => a.vendor_id === v.vendor_id);
        return (
          <Input
            type="email"
            placeholder="e.g. contact@vendor.com"
            className="h-7 text-xs"
            disabled={isDisabled}
            value={
              addIdx >= 0
                ? (addedVendors[addIdx]?.contact_email ?? "")
                : v.contact_email
            }
            onChange={(e) => {
              if (addIdx >= 0)
                updateAddField(addIdx, "contact_email", e.target.value);
            }}
          />
        );
      },
      size: 180,
    };

    const actionCol: ColumnDef<DisplayVendor> = {
      id: "action",
      header: () => "",
      cell: ({ row }) => {
        const v = row.original;
        if (isNewRow(v)) {
          return (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsAdding(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          );
        }
        return (
          <VendorActions
            vendor={v}
            isDisabled={isDisabled}
            onRemove={() => onRemoveVendor(v.vendor_id)}
            router={router}
          />
        );
      },
      enableSorting: false,
      size: 80,
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
    };

    return [
      indexCol,
      vendorNameCol,
      contactPersonCol,
      contactPhoneCol,
      contactEmailCol,
      ...(isDisabled ? [] : [actionCol]),
    ];
  }, [
    isDisabled,
    addedVendors,
    selectedVendorIds,
    updateAddField,
    onAddVendor,
    onRemoveVendor,
    setIsAdding,
    router,
  ]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const addVendorBtn = (
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
  );

  return (
    <div className="space-y-3 pt-4">
      {!isDisabled && addVendorBtn}

      <DataGrid
        table={table}
        recordCount={tableData.length}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
        emptyMessage={
          <EmptyComponent
            icon={Warehouse}
            title="No Vendor Yet"
            description="Add items to this Vendor."
            content={addVendorBtn}
          />
        }
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
      </DataGrid>
    </div>
  );
}

function VendorActions({
  vendor,
  isDisabled,
  onRemove,
  router,
}: {
  vendor: DisplayVendor;
  isDisabled: boolean;
  onRemove: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [copied, setCopied] = useState(false);
  const isExisting = "url_token" in vendor;
  const existingVendor = isExisting ? (vendor as RequestPriceListVendor) : null;

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

  return (
    <div className="flex items-center justify-end gap-0.5">
      {!isDisabled && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleSendEmail}
            title={`Send email to ${vendor.contact_email}`}
          >
            <Mail className="h-3.5 w-3.5" />
          </Button>
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
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
