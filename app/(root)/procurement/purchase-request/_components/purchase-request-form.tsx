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
  useDeletePurchaseRequest,
  useUpdatePr,
  useSplitPurchaseRequest,
  type CreatePurchaseRequestDto,
  type WorkflowStageDetail,
  type ApproveDetail,
} from "@/hooks/use-purchase-request";
import type {
  PurchaseRequest,
  PurchaseRequestTemplate,
} from "@/types/purchase-request";
import { STAGE_ROLE } from "@/types/stage-role";
import { type FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { isoToDateInput } from "@/lib/date-utils";
import { PrGeneralFields } from "./pr-general-fields";
import { PrItemFields } from "./pr-item-fields";
import { PrCommentSheet } from "./pr-comment-sheet";
import { PrFormActions } from "./pr-form-actions";
import { PrActionDialog } from "./pr-action-dialog";
import { Badge } from "@/components/reui/badge";

const detailSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, "Product is required"),
  product_name: z.string(),
  description: z.string(),
  unit_price: z.coerce.number().min(0, "Unit price must be at least 0"),
  vendor_id: z.string(),
  vendor_name: z.string(),
  current_stage_status: z.string(),
  stage_status: z.string().optional(),
  stage_message: z.string().optional(),
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
  tax_profile_id: z.string().nullable().optional(),
  tax_rate: z.coerce.number().optional(),
  tax_amount: z.coerce.number().optional(),
  discount_rate: z.coerce.number().optional(),
  discount_amount: z.coerce.number().optional(),
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
          id: d.id,
          product_id: d.product_id,
          product_name: d.product_name,
          description: d.description ?? "",
          unit_price: d.unit_price,
          vendor_id: d.vendor_id ?? "",
          vendor_name: d.vendor_name ?? "",
          current_stage_status: d.current_stage_status ?? "draft",
          stage_status: d.stage_status ?? "",
          stage_message: d.stage_message ?? "",
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
          tax_profile_id: d.tax_profile_id ?? null,
          tax_rate: d.tax_rate ?? 0,
          tax_amount: d.tax_amount ?? 0,
          discount_rate: d.discount_rate ?? 0,
          discount_amount: d.discount_amount ?? 0,
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
          current_stage_status: "pending",
          stage_status: "",
          stage_message: "",
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
          tax_profile_id: d.tax_profile_id ?? null,
          tax_rate: d.tax_rate ?? 0,
          tax_amount: d.tax_amount ?? 0,
          discount_rate: d.discount_rate ?? 0,
          discount_amount: d.discount_amount ?? 0,
        })) ?? [],
    };
  }
  return EMPTY_FORM;
}

type ActionDialogState = {
  type: "reject" | "sendBack" | "review" | null;
};

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

  // CRUD mutations
  const createPr = useCreatePurchaseRequest();
  const updatePr = useUpdatePr<CreatePurchaseRequestDto & { id: string }>("save");
  const deletePr = useDeletePurchaseRequest();

  // Workflow action mutations
  const submitPr = useUpdatePr("submit");
  const approvePr = useUpdatePr("approve");
  const purchaseApprovePr = useUpdatePr("purchase");
  const rejectPr = useUpdatePr("reject");
  const sendBackPr = useUpdatePr("send_back");
  const reviewPr = useUpdatePr("review");
  const splitPr = useSplitPurchaseRequest();

  const [showDelete, setShowDelete] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    type: null,
  });

  const isPending =
    createPr.isPending ||
    updatePr.isPending ||
    submitPr.isPending ||
    approvePr.isPending ||
    purchaseApprovePr.isPending ||
    rejectPr.isPending ||
    sendBackPr.isPending ||
    reviewPr.isPending ||
    splitPr.isPending;

  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(purchaseRequest, template);
  const role = purchaseRequest?.role;

  const form = useForm<PrFormValues>({
    resolver: zodResolver(prSchema) as Resolver<PrFormValues>,
    defaultValues,
  });

  // --- CRUD Handlers ---

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
          requested_unit_id: item.requested_unit_id,
          unit_price: item.unit_price,
          vendor_id: item.vendor_id,
          pricelist_detail_id: item.pricelist_detail_id,
          current_stage_status: item.current_stage_status || "pending",
          location_id: item.location_id,
          delivery_point_id: item.delivery_point_id,
          delivery_date: item.delivery_date,
          currency_id: item.currency_id,
          foc_qty: item.foc_qty ?? 0,
          foc_unit_id: item.foc_unit_id,
          approved_qty: item.approved_qty ?? 0,
          approved_unit_id: item.approved_unit_id,
          tax_profile_id: item.tax_profile_id,
          tax_rate: item.tax_rate ?? 0,
          tax_amount: item.tax_amount ?? 0,
          discount_rate: item.discount_rate ?? 0,
          discount_amount: item.discount_amount ?? 0,
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

  // --- Workflow Action Handlers ---

  const prepareStageDetails = (
    defaultMessage: string = "",
  ): WorkflowStageDetail[] => {
    const items = form.getValues("items");
    return items
      .filter((item) => item.id)
      .map((item) => ({
        id: item.id!,
        stage_status: item.stage_status || item.current_stage_status || "pending",
        stage_message: item.stage_message || defaultMessage,
      }));
  };

  const prepareApproveDetails = (): ApproveDetail[] => {
    const items = form.getValues("items");
    return items
      .filter((item) => item.id)
      .map((item) => ({
        id: item.id!,
        stage_status: item.stage_status || "approve",
        stage_message: item.stage_message || "",
        approved_qty: Number(item.approved_qty),
        approved_unit_id: item.approved_unit_id || item.requested_unit_id,
        vendor_id: item.vendor_id || undefined,
        pricelist_detail_id: item.pricelist_detail_id,
        unit_price: Number(item.unit_price),
        currency_id: item.currency_id || undefined,
        tax_profile_id: item.tax_profile_id,
        tax_rate: Number(item.tax_rate ?? 0),
        tax_amount: Number(item.tax_amount ?? 0),
        discount_rate: Number(item.discount_rate ?? 0),
        discount_amount: Number(item.discount_amount ?? 0),
        foc_qty: Number(item.foc_qty ?? 0),
        foc_unit_id: item.foc_unit_id || undefined,
      }));
  };

  const handleSubmitPr = () => {
    if (!purchaseRequest) return;
    submitPr.mutate(
      {
        id: purchaseRequest.id,
        state_role: STAGE_ROLE.CREATE,
        details: prepareStageDetails(),
      },
      {
        onSuccess: () => toast.success("Purchase request submitted"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleApprove = () => {
    if (!purchaseRequest) return;
    approvePr.mutate(
      {
        id: purchaseRequest.id,
        state_role: role || STAGE_ROLE.APPROVE,
        details: prepareApproveDetails(),
      },
      {
        onSuccess: () => toast.success("Purchase request approved"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handlePurchaseApprove = () => {
    if (!purchaseRequest) return;
    purchaseApprovePr.mutate(
      {
        id: purchaseRequest.id,
        state_role: STAGE_ROLE.PURCHASE,
        details: prepareApproveDetails(),
      },
      {
        onSuccess: () => toast.success("Purchase approved"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleReject = () => setActionDialog({ type: "reject" });
  const handleSendBack = () => setActionDialog({ type: "sendBack" });
  const handleReview = () => setActionDialog({ type: "review" });

  const handleActionConfirm = (message: string) => {
    if (!purchaseRequest) return;

    const details = prepareStageDetails(message);
    const payload = {
      id: purchaseRequest.id,
      state_role: role || STAGE_ROLE.CREATE,
      details,
    };

    const actionMap = {
      reject: {
        mutation: rejectPr,
        successMsg: "Purchase request rejected",
      },
      sendBack: {
        mutation: sendBackPr,
        successMsg: "Purchase request sent back",
      },
      review: {
        mutation: reviewPr,
        successMsg: "Purchase request sent for review",
      },
    };

    const action = actionDialog.type ? actionMap[actionDialog.type] : null;
    if (!action) return;

    action.mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(action.successMsg);
        setActionDialog({ type: null });
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleSplit = (detailIds: string[]) => {
    if (!purchaseRequest || detailIds.length === 0) return;
    splitPr.mutate(
      { id: purchaseRequest.id, detail_ids: detailIds },
      {
        onSuccess: () => toast.success("Items split to new PR"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  // --- Action Dialog config ---

  const actionDialogConfig = {
    reject: {
      title: "Reject Purchase Request",
      description: "Please provide a reason for rejecting this PR.",
      confirmLabel: "Reject",
      confirmVariant: "destructive" as const,
    },
    sendBack: {
      title: "Send Back Purchase Request",
      description: "Please provide a reason for sending back this PR.",
      confirmLabel: "Send Back",
      confirmVariant: "default" as const,
    },
    review: {
      title: "Send for Review",
      description: "Please provide a reason for sending this PR for review.",
      confirmLabel: "Send for Review",
      confirmVariant: "default" as const,
    },
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
          role={role}
          prStatus={purchaseRequest?.pr_status}
          isPending={isPending}
          isDeletePending={deletePr.isPending}
          hasRecord={!!purchaseRequest}
          onEdit={() => setMode("edit")}
          onCancel={handleCancel}
          onDelete={() => setShowDelete(true)}
          onComment={() => setShowComment(true)}
          onSubmitPr={handleSubmitPr}
          onApprove={handleApprove}
          onReject={handleReject}
          onSendBack={handleSendBack}
          onReview={handleReview}
          onPurchaseApprove={handlePurchaseApprove}
        />
      </div>

      <form
        id="purchase-request-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <PrGeneralFields form={form} disabled={isDisabled} />
        <PrItemFields
          form={form}
          disabled={isDisabled}
          role={role}
          prId={purchaseRequest?.id}
          onSplit={handleSplit}
        />
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

      {actionDialog.type && (
        <PrActionDialog
          open={!!actionDialog.type}
          onOpenChange={(open) => {
            if (!open) setActionDialog({ type: null });
          }}
          isPending={isPending}
          onConfirm={handleActionConfirm}
          {...actionDialogConfig[actionDialog.type]}
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
