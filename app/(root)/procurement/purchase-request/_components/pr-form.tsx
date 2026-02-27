"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
import { WarningDialog } from "@/components/ui/warning-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PR_STATUS_CONFIG } from "@/constant/purchase-request";
import { PrGeneralFields } from "./pr-general-fields";
import { PrItemFields } from "./pr-item-fields";
const PrCommentSheet = dynamic(() =>
  import("./pr-comment-sheet").then((mod) => mod.PrCommentSheet),
);
import { PrFormActions } from "./pr-form-actions";
import { PrFooterAction } from "./pr-footer-action";
import { PrActionDialog } from "./pr-action-dialog";
import { PrWorkflowStep } from "./pr-workflow-step";
import { PrWorkflowHistory } from "./pr-workflow-history";
import {
  prSchema,
  type PrFormValues,
  getDefaultValues,
  mapItemToPayload,
} from "./pr-form-schema";
import { useProfile } from "@/hooks/use-profile";
import { formatDate } from "@/lib/date-utils";

type ActionDialogState = {
  type: "reject" | "send_back" | "review" | null;
};

interface PurchaseRequestFormProps {
  readonly purchaseRequest?: PurchaseRequest;
  readonly template?: PurchaseRequestTemplate;
}

export function PurchaseRequestForm({
  purchaseRequest,
  template,
}: PurchaseRequestFormProps) {
  const {
    data: profile,
    defaultBu,
    buCode,
    dateFormat,
    hasDepartment,
  } = useProfile();

  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(purchaseRequest ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  // CRUD mutations
  const createPr = useCreatePurchaseRequest();
  const updatePr = useUpdatePr<CreatePurchaseRequestDto & { id: string }>(
    "save",
  );
  const deletePr = useDeletePurchaseRequest();

  // Workflow action mutations
  const submitPr = useUpdatePr("submit");
  const approvePr = useUpdatePr("approve");
  const purchaseApprovePr = useUpdatePr("approve");
  const rejectPr = useUpdatePr("reject");
  const sendBackPr = useUpdatePr("send_back");
  const reviewPr = useUpdatePr("review");
  const splitPr = useSplitPurchaseRequest();

  const [showDelete, setShowDelete] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const showNoDepartment = isAdd && !!profile && !!defaultBu && !hasDepartment;
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null);
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

  const requestorName = profile
    ? `${profile.user_info.firstname} ${profile.user_info.lastname}`
    : "";

  const defaultRequestorName = purchaseRequest?.requestor_name;
  const defaultRequestorId = profile?.id ?? "";
  const defaultDefaultId = defaultBu?.department?.id ?? "";
  const defaultDepartmentName = purchaseRequest?.department_name;
  const defaultPrDate = purchaseRequest?.pr_date;

  const reqName = defaultRequestorName ?? requestorName;

  const departmentName =
    defaultDepartmentName ?? defaultBu?.department?.name ?? "";

  const [todayIso] = useState(() => new Date().toISOString());
  const prDateDisplay = formatDate(defaultPrDate || todayIso, dateFormat);

  useEffect(() => {
    if (!form.getValues("pr_date")) {
      form.setValue("pr_date", new Date().toISOString().split("T")[0]);
    }
    if (!profile || !defaultBu) return;
    if (!form.getValues("requestor_id")) {
      form.setValue("requestor_id", defaultRequestorId);
    }
    if (!form.getValues("department_id")) {
      form.setValue("department_id", defaultDefaultId);
    }
  }, [
    profile,
    defaultBu,
    form,
    defaultRequestorId,
    defaultDefaultId,
    isAdd,
    hasDepartment,
  ]);

  // --- CRUD Handlers ---

  const onSubmit = (values: PrFormValues) => {
    const newItems = values.items.filter((item) => !item.id);
    const existingItems = values.items.filter(
      (item): item is typeof item & { id: string } => !!item.id,
    );

    // Items in defaults but no longer in form → removed
    const currentIds = new Set(existingItems.map((item) => item.id));
    const removedItems = defaultValues.items
      .filter(
        (item): item is typeof item & { id: string } =>
          !!item.id && !currentIds.has(item.id),
      )
      .map((item) => ({ id: item.id }));

    // Existing items that changed → update
    const updatedItems = existingItems.filter((item) => {
      const idx = values.items.findIndex((v) => v.id === item.id);
      const dirty = form.formState.dirtyFields.items?.[idx];
      return dirty != null && Object.keys(dirty).length > 0;
    });

    const purchase_request_detail: CreatePurchaseRequestDto["details"]["purchase_request_detail"] =
      {};
    if (newItems.length > 0) {
      purchase_request_detail.add = newItems.map(mapItemToPayload);
    }
    if (updatedItems.length > 0) {
      purchase_request_detail.update = updatedItems.map((item) => ({
        id: item.id,
        ...mapItemToPayload(item),
      }));
    }
    if (removedItems.length > 0) {
      purchase_request_detail.remove = removedItems;
    }

    const details: CreatePurchaseRequestDto["details"] = {
      pr_date: new Date(values.pr_date).toISOString(),
      description: values.description,
      requestor_id: values.requestor_id,
      workflow_id: values.workflow_id,
      department_id: values.department_id,
      purchase_request_detail,
    };

    if (isEdit && purchaseRequest) {
      updatePr.mutate(
        {
          id: purchaseRequest.id,
          stage_role: "create",
          details,
        },
        {
          onSuccess: () => {
            toast.success("Purchase request updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createPr.mutate(
        { stage_role: "create", details },
        {
          onSuccess: (data) => {
            toast.success("Purchase request created successfully");
            if (data?.data?.id) {
              router.replace(`/procurement/purchase-request/${data.data.id}`);
            }
          },
          onError: (err) => toast.error(err.message),
        },
      );
    }
  };

  const handleCancel = () => {
    const doCancel = () => {
      if (isEdit && purchaseRequest) {
        form.reset(defaultValues);
        setMode("view");
      } else {
        router.push("/procurement/purchase-request");
      }
    };

    if (form.formState.isDirty) {
      setDiscardAction(() => doCancel);
      setShowDiscard(true);
    } else {
      doCancel();
    }
  };

  const handleBack = () => {
    const doBack = () => router.push("/procurement/purchase-request");

    if ((isEdit || isAdd) && form.formState.isDirty) {
      setDiscardAction(() => doBack);
      setShowDiscard(true);
    } else {
      doBack();
    }
  };

  const prepareStageDetails = (
    defaultMessage: string = "",
  ): WorkflowStageDetail[] => {
    const items = form.getValues("items");
    return items
      .filter((item) => item.id)
      .map((item) => ({
        id: item.id!,
        stage_status: "submit",
        stage_message: item.stage_message || defaultMessage,
      }));
  };

  const prepareApproveDetails = (): ApproveDetail[] => {
    const items = form.getValues("items");
    return items
      .filter((item) => item.id)
      .map((item) => ({
        id: item.id!,
        purchase_request_id: purchaseRequest?.id,
        stage_status: item.stage_status || "approve",
        stage_message: item.stage_message || "",
        approved_qty: Number(item.approved_qty),
        approved_unit_id: item.approved_unit_id || item.requested_unit_id,
        vendor_id: item.vendor_id || undefined,
        pricelist_detail_id: item.pricelist_detail_id,
        pricelist_price: Number(item.pricelist_price),
        pricelist_no: item.pricelist_no,
        pricelist_type: item.pricelist_type || null,
        currency_id: item.currency_id || undefined,
        delivery_point_id: item.delivery_point_id,
        delivery_date: item.delivery_date,
        location_id: item.location_id,
        tax_profile_id: item.tax_profile_id,
        tax_rate: Number(item.tax_rate ?? 0),
        tax_amount: Number(item.tax_amount ?? 0),
        is_tax_adjustment: item.is_tax_adjustment ?? false,
        discount_rate: Number(item.discount_rate ?? 0),
        discount_amount: Number(item.discount_amount ?? 0),
        is_discount_adjustment: item.is_discount_adjustment ?? false,
        net_amount: Number(item.net_amount ?? 0),
        total_price: Number(item.total_price ?? 0),
        foc_qty: Number(item.foc_qty ?? 0),
        foc_unit_id: item.foc_unit_id || undefined,
      }));
  };

  const handleSubmitPr = () => {
    if (!purchaseRequest) return;
    submitPr.mutate(
      {
        id: purchaseRequest.id,
        stage_role: STAGE_ROLE.CREATE,
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
        stage_role: role || STAGE_ROLE.APPROVE,
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
        stage_role: STAGE_ROLE.PURCHASE,
        details: prepareApproveDetails(),
      },
      {
        onSuccess: () => toast.success("Purchase approved"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleReject = () => setActionDialog({ type: "reject" });
  const handleSendBack = () => setActionDialog({ type: "send_back" });

  const handleActionConfirm = (message: string) => {
    if (!purchaseRequest) return;

    const details = prepareStageDetails(message);
    const payload = {
      id: purchaseRequest.id,
      stage_role: role || STAGE_ROLE.CREATE,
      details,
    };

    const actionMap = {
      reject: {
        mutation: rejectPr,
        successMsg: "Purchase request rejected",
      },
      send_back: {
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
        onSuccess: (data) => {
          const items = form.getValues("items");
          const detailIdSet = new Set(detailIds);
          for (const [index, item] of items.entries()) {
            if (item.id && detailIdSet.has(item.id)) {
              form.setValue(`items.${index}.current_stage_status`, "rejected");
              form.setValue(`items.${index}.stage_status`, "rejected");
            }
          }

          // Open new PR in new tab
          const newPrId = data?.data?.id;
          if (newPrId) {
            window.open(`/procurement/purchase-request/${newPrId}`, "_blank");
          }

          toast.success("Items split to new PR");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const actionDialogConfig = {
    reject: {
      title: "Reject Purchase Request",
      description: "Please provide a reason for rejecting this PR.",
      confirmLabel: "Reject",
      confirmVariant: "destructive" as const,
    },
    send_back: {
      title: "Send Back Purchase Request",
      description: "Please provide a reason for sending back this PR.",
      confirmLabel: "Send Back",
      confirmVariant: "warning" as const,
    },
    review: {
      title: "Send for Review",
      description: "Please provide a reason for sending this PR for review.",
      confirmLabel: "Send for Review",
      confirmVariant: "warning" as const,
    },
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Go back"
            onClick={handleBack}
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
              <Badge
                variant={
                  PR_STATUS_CONFIG[purchaseRequest?.pr_status ?? "draft"]
                    ?.variant
                }
              >
                {PR_STATUS_CONFIG[purchaseRequest?.pr_status ?? "draft"]
                  ?.label ?? purchaseRequest?.pr_status}
              </Badge>
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
        />
      </div>

      <form
        id="purchase-request-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <PrGeneralFields
          form={form}
          disabled={isDisabled}
          reqName={reqName}
          departmentName={departmentName ?? ""}
          prDateDisplay={prDateDisplay}
        />

        {purchaseRequest?.workflow_current_stage && (
          <PrWorkflowStep
            previousStage={purchaseRequest.workflow_previous_stage}
            currentStage={purchaseRequest.workflow_current_stage}
            nextStage={purchaseRequest.workflow_next_stage}
          />
        )}

        <Tabs defaultValue="items">
          <TabsList variant="line">
            <TabsTrigger value="items">Items</TabsTrigger>
            {(purchaseRequest?.workflow_history?.length ?? 0) > 0 && (
              <TabsTrigger value="history">Workflow History</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="items">
            <PrItemFields
              form={form}
              isDisabled={isDisabled}
              isAdd={isAdd}
              role={role}
              prId={purchaseRequest?.id}
              prStatus={purchaseRequest?.pr_status}
              buCode={buCode}
              defaultBu={defaultBu}
              dateFormat={dateFormat}
              onSplit={handleSplit}
            />
          </TabsContent>
          {(purchaseRequest?.workflow_history?.length ?? 0) > 0 && (
            <TabsContent value="history">
              <PrWorkflowHistory history={purchaseRequest!.workflow_history} />
            </TabsContent>
          )}
        </Tabs>
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

      <WarningDialog
        open={showNoDepartment}
        description="Your profile does not have a department assigned. Please contact your administrator."
        onConfirm={() => router.back()}
      />

      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                discardAction?.();
                setDiscardAction(null);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PrFooterAction
        role={role}
        prStatus={purchaseRequest?.pr_status}
        isPending={isPending}
        hasRecord={!!purchaseRequest}
        control={form.control}
        currencyCode={defaultBu?.config?.default_currency?.code ?? ""}
        onSubmitPr={handleSubmitPr}
        onApprove={handleApprove}
        onReject={handleReject}
        onSendBack={handleSendBack}
        onPurchaseApprove={handlePurchaseApprove}
      />
    </div>
  );
}
