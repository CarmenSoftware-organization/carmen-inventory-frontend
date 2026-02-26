"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Check, MessageSquare, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormToolbar } from "@/components/ui/form-toolbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCreateGoodsReceiveNote,
  useUpdateGoodsReceiveNote,
  useDeleteGoodsReceiveNote,
  useConfirmGoodsReceiveNote,
  useRejectGoodsReceiveNote,
} from "@/hooks/use-goods-receive-note";
import type {
  GoodsReceiveNote,
  CreateGrnDto,
} from "@/types/goods-receive-note";
import type { FormMode } from "@/types/form";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { GrnGeneralFields } from "./grn-general-fields";
import { GrnDetailFields } from "./grn-detail-fields";
import { GrnPaymentFields } from "./grn-payment-fields";
import { GrnExtraCostFields } from "./grn-extra-cost-fields";
import {
  grnSchema,
  type GrnFormValues,
  getDefaultValues,
  mapDetailToPayload,
  mapExtraCostToPayload,
} from "./grn-form-schema";
import { textToObject } from "@/lib/form-helpers";

const GrnCommentSheet = dynamic(() =>
  import("./grn-comment-sheet").then((mod) => mod.GrnCommentSheet),
);

interface GrnFormProps {
  readonly goodsReceiveNote?: GoodsReceiveNote;
}

export function GrnForm({ goodsReceiveNote }: GrnFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(goodsReceiveNote ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createGrn = useCreateGoodsReceiveNote();
  const updateGrn = useUpdateGoodsReceiveNote();
  const deleteGrn = useDeleteGoodsReceiveNote();
  const confirmGrn = useConfirmGoodsReceiveNote();
  const rejectGrn = useRejectGoodsReceiveNote();
  const [showDelete, setShowDelete] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const isPending = createGrn.isPending || updateGrn.isPending;
  const isActionPending = confirmGrn.isPending || rejectGrn.isPending;
  const isDisabled = isView || isPending;

  const defaultValues = getDefaultValues(goodsReceiveNote);

  const form = useForm<GrnFormValues>({
    resolver: zodResolver(grnSchema) as Resolver<GrnFormValues>,
    defaultValues,
  });

  const onSubmit = (values: GrnFormValues) => {
    // --- Detail items: add / update / remove ---
    const newItems = values.items.filter((item) => !item.id);
    const existingItems = values.items.filter(
      (item): item is typeof item & { id: string } => !!item.id,
    );
    const currentIds = new Set(existingItems.map((item) => item.id));
    const removedItems = defaultValues.items
      .filter(
        (item): item is typeof item & { id: string } =>
          !!item.id && !currentIds.has(item.id),
      )
      .map((item) => ({ id: item.id }));
    const updatedItems = existingItems.filter((item) => {
      const idx = values.items.findIndex((v) => v.id === item.id);
      const dirty = form.formState.dirtyFields.items?.[idx];
      return dirty != null && Object.keys(dirty).length > 0;
    });

    const detail: CreateGrnDto["good_received_note_detail"] = {};
    if (newItems.length > 0) detail.add = newItems.map(mapDetailToPayload);
    if (updatedItems.length > 0)
      detail.update = updatedItems.map((item) => ({
        id: item.id,
        ...mapDetailToPayload(item),
      }));
    if (removedItems.length > 0) detail.remove = removedItems;

    // --- Extra cost details: add / update / remove ---
    const newCosts = values.extra_cost_details.filter((c) => !c.id);
    const existingCosts = values.extra_cost_details.filter(
      (c): c is typeof c & { id: string } => !!c.id,
    );
    const currentCostIds = new Set(existingCosts.map((c) => c.id));
    const removedCosts = defaultValues.extra_cost_details
      .filter(
        (c): c is typeof c & { id: string } =>
          !!c.id && !currentCostIds.has(c.id),
      )
      .map((c) => ({ id: c.id }));
    const updatedCosts = existingCosts.filter((c) => {
      const idx = values.extra_cost_details.findIndex((v) => v.id === c.id);
      const dirty = form.formState.dirtyFields.extra_cost_details?.[idx];
      return dirty != null && Object.keys(dirty).length > 0;
    });

    const extraCostDetail: NonNullable<
      CreateGrnDto["extra_cost"]
    >["extra_cost_detail"] = {};
    if (newCosts.length > 0)
      extraCostDetail.add = newCosts.map(mapExtraCostToPayload);
    if (updatedCosts.length > 0)
      extraCostDetail.update = updatedCosts.map((c) => ({
        id: c.id,
        ...mapExtraCostToPayload(c),
      }));
    if (removedCosts.length > 0) extraCostDetail.remove = removedCosts;

    const payload: CreateGrnDto = {
      grn_date: values.grn_date || null,
      expired_date: values.expired_date || null,
      invoice_no: values.invoice_no || null,
      invoice_date: values.invoice_date || null,
      description: values.description || null,
      note: values.note || null,
      doc_status: values.doc_status,
      doc_type: values.doc_type,
      is_consignment: values.is_consignment,
      is_cash: values.is_cash,
      signature_image_url: values.signature_image_url || null,
      received_by_id: values.received_by_id,
      received_by_name: values.received_by_name || undefined,
      received_at: values.received_at,
      credit_term_id: values.credit_term_id,
      credit_term_name: values.credit_term_name || undefined,
      credit_term_days: values.credit_term_days,
      payment_due_date: values.payment_due_date,
      is_active: values.is_active,
      vendor_id: values.vendor_id!,
      vendor_name: values.vendor_name || undefined,
      approved_unit_conversion_factor: values.approved_unit_conversion_factor,
      requested_unit_conversion_factor: values.requested_unit_conversion_factor,
      currency_id: values.currency_id,
      currency_name: values.currency_name || undefined,
      exchange_rate: values.exchange_rate,
      exchange_rate_date: values.exchange_rate_date,
      discount_rate: values.discount_rate,
      discount_amount: values.discount_amount,
      is_discount_adjustment: values.is_discount_adjustment,
      base_discount_amount: values.base_discount_amount,
      info: textToObject(values.info),
      dimension: textToObject(values.dimension),
      good_received_note_detail: detail,
      extra_cost: {
        name: values.extra_cost_name || undefined,
        note: values.extra_cost_note || undefined,
        allocate_extracost_type: values.allocate_extracost_type || undefined,
        extra_cost_detail: extraCostDetail,
      },
    };

    if (isEdit && goodsReceiveNote) {
      updateGrn.mutate(
        { id: goodsReceiveNote.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Goods receive note updated successfully");
            setMode("view");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createGrn.mutate(payload, {
        onSuccess: () => {
          toast.success("Goods receive note created successfully");
          router.push("/procurement/goods-receive-note");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && goodsReceiveNote) {
      form.reset(defaultValues);
      setMode("view");
    } else {
      router.push("/procurement/goods-receive-note");
    }
  };

  return (
    <div className="space-y-4">
      <FormToolbar
        entity="Goods Receive Note"
        mode={mode}
        formId="grn-form"
        isPending={isPending}
        onBack={() => router.push("/procurement/goods-receive-note")}
        onEdit={() => setMode("edit")}
        onCancel={handleCancel}
        onDelete={goodsReceiveNote ? () => setShowDelete(true) : undefined}
        deleteIsPending={deleteGrn.isPending}
      >
        {goodsReceiveNote && isView && (
          <>
            <Button
              variant="success"
              size="sm"
              onClick={() =>
                confirmGrn.mutate(goodsReceiveNote.id, {
                  onSuccess: () =>
                    toast.success("Goods receive note confirmed"),
                  onError: (err) => toast.error(err.message),
                })
              }
              disabled={isActionPending}
            >
              <Check aria-hidden="true" />
              Confirm
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                rejectGrn.mutate(goodsReceiveNote.id, {
                  onSuccess: () => toast.success("Goods receive note rejected"),
                  onError: (err) => toast.error(err.message),
                })
              }
              disabled={isActionPending}
            >
              <X aria-hidden="true" />
              Reject
            </Button>
          </>
        )}
        {goodsReceiveNote && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowComment(true)}
          >
            <MessageSquare aria-hidden="true" />
            Comment
          </Button>
        )}
      </FormToolbar>

      <form id="grn-form" onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            <TabsTrigger value="detail" className="text-xs">
              Detail
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">
              Payment
            </TabsTrigger>
            <TabsTrigger value="extra-cost" className="text-xs">
              Extra Cost
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GrnGeneralFields form={form} disabled={isDisabled} />
          </TabsContent>

          <TabsContent value="detail">
            <GrnDetailFields form={form} disabled={isDisabled} />
          </TabsContent>

          <TabsContent value="payment">
            <GrnPaymentFields form={form} disabled={isDisabled} />
          </TabsContent>

          <TabsContent value="extra-cost">
            <GrnExtraCostFields form={form} disabled={isDisabled} />
          </TabsContent>
        </Tabs>
      </form>

      {goodsReceiveNote && (
        <>
          <DeleteDialog
            open={showDelete}
            onOpenChange={(open) =>
              !open && !deleteGrn.isPending && setShowDelete(false)
            }
            title="Delete Goods Receive Note"
            description={`Are you sure you want to delete this goods receive note? This action cannot be undone.`}
            isPending={deleteGrn.isPending}
            onConfirm={() => {
              deleteGrn.mutate(goodsReceiveNote.id, {
                onSuccess: () => {
                  toast.success("Goods receive note deleted successfully");
                  router.push("/procurement/goods-receive-note");
                },
                onError: (err) => toast.error(err.message),
              });
            }}
          />
          <GrnCommentSheet
            grnId={goodsReceiveNote.id}
            open={showComment}
            onOpenChange={setShowComment}
          />
        </>
      )}
    </div>
  );
}
