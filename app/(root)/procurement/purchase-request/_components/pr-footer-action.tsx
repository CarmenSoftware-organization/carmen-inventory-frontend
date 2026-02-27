import { useState, useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
import { Check, Eye, SendHorizonal, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { STAGE_ROLE } from "@/types/stage-role";
import { formatCurrency } from "@/lib/currency-utils";
import type { PrFormValues } from "./pr-form-schema";

interface PrFooterActionProps {
  readonly role?: string;
  readonly prStatus?: string;
  readonly isPending: boolean;
  readonly hasRecord: boolean;
  readonly control: Control<PrFormValues>;
  readonly currencyCode?: string;
  readonly onSubmitPr?: () => void;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  readonly onSendBack?: () => void;
  readonly onPurchaseApprove?: () => void;
}

type ConfirmConfig = {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "default" | "destructive" | "success" | "info" | "warning";
  onConfirm: () => void;
};

const computePurchaseAction = (
  statuses: string[],
): "none" | "review" | "rejected" | "approved" => {
  if (statuses.length === 0) return "none";
  if (statuses.includes("review")) return "review";
  if (statuses.includes("pending") || statuses.includes("")) return "none";
  if (statuses.includes("approved")) return "approved";
  if (statuses.every((s) => s === "rejected")) return "rejected";
  return "none";
};

export function PrFooterAction({
  role,
  prStatus,
  isPending,
  hasRecord,
  control,
  currencyCode,
  onSubmitPr,
  onApprove,
  onReject,
  onSendBack,
  onPurchaseApprove,
}: PrFooterActionProps) {
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const isVoided = prStatus === "voided";
  const isViewOnly = role === STAGE_ROLE.VIEW_ONLY;
  const showWorkflowActions = hasRecord && !isVoided && !isViewOnly;

  const items = useWatch({ control, name: "items" });

  const itemStatuses = useMemo(
    () =>
      items.map((item) =>
        typeof item?.current_stage_status === "string"
          ? item.current_stage_status
          : "",
      ),
    [items],
  );

  const summary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalNet = 0;
    let totalTax = 0;
    let grandTotal = 0;

    for (const item of items) {
      const price = Number(item?.pricelist_price ?? 0);
      const qty = Number(item?.requested_qty ?? 0);
      subtotal += price * qty;
      totalDiscount += Number(item?.discount_amount ?? 0);
      totalNet += Number(item?.net_amount ?? 0);
      totalTax += Number(item?.tax_amount ?? 0);
      grandTotal += Number(item?.total_price ?? 0);
    }

    return { subtotal, totalDiscount, totalNet, totalTax, grandTotal };
  }, [items]);

  const canSubmit = role === STAGE_ROLE.CREATE && prStatus !== "in_progress";
  const canApprove = role === STAGE_ROLE.APPROVE;
  const canPurchaseApprove = role === STAGE_ROLE.PURCHASE;
  const purchaseAction = computePurchaseAction(itemStatuses);

  if (!hasRecord) return null;

  const hasVisibleButton =
    showWorkflowActions &&
    (canSubmit ||
      (canApprove && purchaseAction !== "none") ||
      (canPurchaseApprove && purchaseAction !== "none"));

  const openConfirm = (config: ConfirmConfig) => setConfirm(config);

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-2 sticky bottom-0 z-20 border-t bg-background mt-auto">
        <div className="flex items-center gap-4 text-xs tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Discount</span>
            <span
              className={
                summary.totalDiscount > 0
                  ? "font-medium text-destructive"
                  : "font-medium"
              }
            >
              {summary.totalDiscount > 0
                ? `-${formatCurrency(summary.totalDiscount)}`
                : formatCurrency(0)}
            </span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Net</span>
            <span className="font-medium">{formatCurrency(summary.totalNet)}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">{formatCurrency(summary.totalTax)}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatCurrency(summary.grandTotal)}</span>
            {currencyCode && (
              <span className="text-muted-foreground font-normal text-xs">
                {currencyCode}
              </span>
            )}
          </div>
        </div>

        {hasVisibleButton && (
        <div className="flex items-center gap-2 shrink-0">
          {canSubmit && (
            <Button
              type="button"
              size="sm"
              variant="info"
              disabled={isPending}
              onClick={() =>
                openConfirm({
                  title: "Submit Purchase Request",
                  description:
                    "This will submit the PR for approval. Are you sure?",
                  confirmLabel: "Submit",
                  variant: "info",
                  onConfirm: () => onSubmitPr?.(),
                })
              }
            >
              <SendHorizonal />
              Submit
            </Button>
          )}

          {canApprove && purchaseAction === "approved" && (
            <Button
              type="button"
              size="sm"
              variant="success"
              disabled={isPending}
              onClick={() =>
                openConfirm({
                  title: "Approve Purchase Request",
                  description:
                    "This will approve the PR and move it to the next stage. Are you sure?",
                  confirmLabel: "Approve",
                  variant: "success",
                  onConfirm: () => onApprove?.(),
                })
              }
            >
              <Check />
              Approve
            </Button>
          )}

          {canApprove && purchaseAction === "rejected" && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                openConfirm({
                  title: "Reject Purchase Request",
                  description:
                    "All items are rejected. This will reject the PR. Are you sure?",
                  confirmLabel: "Reject",
                  variant: "destructive",
                  onConfirm: () => onReject?.(),
                })
              }
            >
              <X />
              Reject
            </Button>
          )}

          {canApprove && purchaseAction === "review" && (
            <Button
              type="button"
              size="sm"
              variant="warning"
              disabled={isPending}
              onClick={() =>
                openConfirm({
                  title: "Send Back Purchase Request",
                  description:
                    "Some items need review. This will send the PR back. Are you sure?",
                  confirmLabel: "Send Back",
                  variant: "warning",
                  onConfirm: () => onSendBack?.(),
                })
              }
            >
              <Eye />
              Send Back
            </Button>
          )}

          {canPurchaseApprove && purchaseAction === "approved" && (
            <Button
              type="button"
              size="sm"
              variant="success"
              disabled={isPending}
              onClick={() =>
                openConfirm({
                  title: "Purchase Approve",
                  description:
                    "This will approve for purchasing. Are you sure?",
                  confirmLabel: "Purchase Approve",
                  variant: "success",
                  onConfirm: () => onPurchaseApprove?.(),
                })
              }
            >
              <ShoppingCart />
              Approve
            </Button>
          )}

          {canPurchaseApprove && purchaseAction === "rejected" && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                openConfirm({
                  title: "Reject Purchase Request",
                  description:
                    "All items are rejected. This will reject the PR. Are you sure?",
                  confirmLabel: "Reject",
                  variant: "destructive",
                  onConfirm: () => onReject?.(),
                })
              }
            >
              <X />
              Reject
            </Button>
          )}

          {canPurchaseApprove && purchaseAction === "review" && (
            <Button
              type="button"
              size="sm"
              variant="warning"
              disabled={isPending}
              onClick={() =>
                openConfirm({
                  title: "Send Back Purchase Request",
                  description:
                    "Some items need review. This will send the PR back. Are you sure?",
                  confirmLabel: "Send Back",
                  variant: "warning",
                  onConfirm: () => onSendBack?.(),
                })
              }
            >
              <Eye />
              Send Back
            </Button>
          )}
        </div>
        )}
      </div>

      <AlertDialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        {confirm && (
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirm.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant={confirm.variant}
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm(null);
                }}
              >
                {confirm.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  );
}
