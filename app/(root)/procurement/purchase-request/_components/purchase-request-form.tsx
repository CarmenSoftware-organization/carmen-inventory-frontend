"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  useDeletePurchaseRequest,
  type CreatePurchaseRequestDto,
} from "@/hooks/use-purchase-request";
import type {
  PurchaseRequest,
  PurchaseRequestTemplate,
} from "@/types/purchase-request";
import { type FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { isoToDateInput } from "@/lib/date-utils";
import { PrGeneralFields } from "./pr-general-fields";
import { PrItemFields } from "./pr-item-fields";
import { PrCommentSheet } from "./pr-comment-sheet";
import { PrFormActions } from "./pr-form-actions";
import { Badge } from "@/components/reui/badge";

const detailSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string(),
  description: z.string(),
  unit_price: z.coerce.number().min(0, "Unit price must be at least 0"),
  vendor_id: z.string(),
  vendor_name: z.string(),
  current_stage_status: z.string(),
  location_id: z.string(),
  requested_qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  requested_unit_id: z.string(),
  requested_unit_name: z.string(),
  foc_qty: z.coerce.number().min(0),
  foc_unit_id: z.string(),
  foc_unit_name: z.string(),
  approved_qty: z.coerce.number().min(0),
  approved_unit_id: z.string(),
  approved_unit_name: z.string(),
  currency_id: z.string(),
  delivery_point_id: z.string(),
  delivery_date: z.string(),
  pricelist_detail_id: z.string().nullable(),
  pricelist_no: z.string().nullable(),
});

const prSchema = z.object({
  pr_date: z.string().min(1, "PR date is required"),
  description: z.string(),
  workflow_id: z.string(),
  requestor_id: z.string(),
  department_id: z.string().min(1, "Department is required"),
  items: z.array(detailSchema),
});

export type PrFormValues = z.infer<typeof prSchema>;

const EMPTY_FORM: PrFormValues = {
  pr_date: "",
  description: "",
  workflow_id: "",
  requestor_id: "",
  department_id: "",
  items: [],
};

function getDefaultValues(
  purchaseRequest?: PurchaseRequest,
  template?: PurchaseRequestTemplate,
): PrFormValues {
  if (purchaseRequest) {
    return {
      pr_date: isoToDateInput(purchaseRequest.pr_date),
      description: purchaseRequest.description ?? "",
      workflow_id: purchaseRequest.workflow_id ?? "",
      requestor_id: purchaseRequest.requestor_id ?? "",
      department_id: purchaseRequest.department_id ?? "",
      items:
        purchaseRequest.purchase_request_detail?.map((d) => ({
          product_id: d.product_id,
          product_name: d.product_name,
          description: d.description ?? "",
          unit_price: d.unit_price,
          vendor_id: d.vendor_id ?? "",
          vendor_name: d.vendor_name ?? "",
          current_stage_status: d.current_stage_status ?? "draft",
          location_id: d.location_id ?? "",
          requested_qty: d.requested_qty,
          requested_unit_id: d.requested_unit_id ?? "",
          requested_unit_name: d.requested_unit_name ?? "",
          foc_qty: d.foc_qty ?? 0,
          foc_unit_id: d.foc_unit_id ?? "",
          foc_unit_name: d.foc_unit_name ?? "",
          approved_qty: d.approved_qty ?? 0,
          approved_unit_id: d.approved_unit_id ?? "",
          approved_unit_name: d.approved_unit_name ?? "",
          currency_id: d.currency_id ?? "",
          delivery_point_id: d.delivery_point_id ?? "",
          delivery_date: d.delivery_date ?? "",
          pricelist_detail_id: d.pricelist_detail_id ?? null,
          pricelist_no: d.pricelist_no ?? null,
        })) ?? [],
    };
  }
  if (template) {
    return {
      ...EMPTY_FORM,
      description: template.description ?? "",
      workflow_id: template.workflow_id ?? "",
      department_id: template.department_id ?? "",
      items:
        template.purchase_request_template_detail?.map((d) => ({
          product_id: d.product_id,
          product_name: d.product_name,
          description: d.description ?? "",
          unit_price: 0,
          vendor_id: "",
          vendor_name: "",
          current_stage_status: "draft",
          location_id: d.location_id ?? "",
          requested_qty: d.requested_qty,
          requested_unit_id: d.requested_unit_id ?? "",
          requested_unit_name: d.requested_unit_name ?? "",
          foc_qty: d.foc_qty ?? 0,
          foc_unit_id: d.foc_unit_id ?? "",
          foc_unit_name: d.foc_unit_name ?? "",
          approved_qty: 0,
          approved_unit_id: "",
          approved_unit_name: "",
          currency_id: d.currency_id ?? "",
          delivery_point_id: "",
          delivery_date: "",
          pricelist_detail_id: null,
          pricelist_no: null,
        })) ?? [],
    };
  }
  return EMPTY_FORM;
}

interface PurchaseRequestFormProps {
  readonly purchaseRequest?: PurchaseRequest;
  readonly template?: PurchaseRequestTemplate;
}

export function PurchaseRequestForm({
  purchaseRequest,
  template,
}: PurchaseRequestFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(purchaseRequest ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createPr = useCreatePurchaseRequest();
  const updatePr = useUpdatePurchaseRequest();
  const deletePr = useDeletePurchaseRequest();
  const [showDelete, setShowDelete] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const isPending = createPr.isPending || updatePr.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(purchaseRequest, template);

  const form = useForm<PrFormValues>({
    resolver: zodResolver(prSchema) as Resolver<PrFormValues>,
    defaultValues,
  });

  const onSubmit = (values: PrFormValues) => {
    const details: CreatePurchaseRequestDto["details"] = {
      pr_date: new Date(values.pr_date).toISOString(),
      description: values.description,
      requestor_id: values.requestor_id,
      workflow_id: values.workflow_id,
      department_id: values.department_id,
      purchase_request_detail: {
        add: values.items.map((item) => ({
          product_id: item.product_id,
          description: item.description,
          requested_qty: item.requested_qty,
          unit_price: item.unit_price,
          vendor_id: item.vendor_id,
          pricelist_detail_id: item.pricelist_detail_id,
          current_stage_status: item.current_stage_status || "draft",
        })),
      },
    };

    if (isEdit && purchaseRequest) {
      updatePr.mutate(
        {
          id: purchaseRequest.id,
          state_role: "create",
          details,
        },
        {
          onSuccess: () => {
            toast.success("Purchase request updated successfully");
            router.push("/procurement/purchase-request");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createPr.mutate(
        { state_role: "create", details },
        {
          onSuccess: () => {
            toast.success("Purchase request created successfully");
            router.push("/procurement/purchase-request");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  const handleCancel = () => {
    if (isEdit && purchaseRequest) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/procurement/purchase-request");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/procurement/purchase-request")}
          >
            <ArrowLeft />
          </Button>
          {mode === "add" ? (
            <h1 className="font-semibold text-lg">New Purchase Request</h1>
          ) : (
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-lg">
                {purchaseRequest?.pr_no}
              </h1>
              <Badge>{purchaseRequest?.pr_status}</Badge>
            </div>
          )}
        </div>
        <PrFormActions
          mode={mode}
          isPending={isPending}
          isDeletePending={deletePr.isPending}
          hasRecord={!!purchaseRequest}
          onEdit={() => setMode("edit")}
          onCancel={handleCancel}
          onDelete={() => setShowDelete(true)}
          onComment={() => setShowComment(true)}
        />
      </div>

      <form
        id="purchase-request-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <PrGeneralFields form={form} disabled={isDisabled} />
        <PrItemFields form={form} disabled={isDisabled} />
      </form>

      {purchaseRequest && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deletePr.isPending && setShowDelete(false)
          }
          title="Delete Purchase Request"
          description={`Are you sure you want to delete "${purchaseRequest.pr_no}"? This action cannot be undone.`}
          isPending={deletePr.isPending}
          onConfirm={() => {
            deletePr.mutate(purchaseRequest.id, {
              onSuccess: () => {
                toast.success("Purchase request deleted successfully");
                router.push("/procurement/purchase-request");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}

      <PrCommentSheet
        prId={purchaseRequest?.id}
        open={showComment}
        onOpenChange={setShowComment}
      />
    </div>
  );
}
