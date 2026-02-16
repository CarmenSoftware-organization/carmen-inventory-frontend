/** Badge variant + label for PR item-level status */
export const PR_ITEM_STATUS_CONFIG: Record<
  string,
  { variant: "warning" | "success" | "info" | "destructive"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  review: { variant: "info", label: "Review" },
  rejected: { variant: "destructive", label: "Rejected" },
};

/** Badge variant for workflow history actions */
export const PR_WORKFLOW_ACTION_VARIANT: Record<
  string,
  "secondary" | "success" | "destructive" | "warning" | "outline"
> = {
  submitted: "secondary",
  approved: "success",
  rejected: "destructive",
  sent_back: "warning",
  reviewed: "outline",
};

export const PURCHASE_REQUEST_STATUS_OPTIONS = [
  { label: "Draft", value: "doc_status|string:draft" },
  { label: "Submitted", value: "doc_status|string:submitted" },
  { label: "Approved", value: "doc_status|string:approved" },
  { label: "Rejected", value: "doc_status|string:rejected" },
];
