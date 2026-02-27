type BadgeVariant =
  | "outline"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "destructive";

/** Badge variant + label for PR document-level status */
export const PR_STATUS_CONFIG: Record<
  string,
  { variant: BadgeVariant; label: string }
> = {
  draft: { variant: "secondary", label: "DRAFT" },
  submitted: { variant: "info", label: "SUBMITTED" },
  in_progress: { variant: "warning", label: "IN PROGRESS" },
  approved: { variant: "success", label: "APPROVED" },
  rejected: { variant: "destructive", label: "REJECTED" },
  completed: { variant: "success", label: "COMPLETED" },
  voided: { variant: "destructive", label: "VOIDED" },
};

/** Badge variant + label for PR item-level status */
export const PR_ITEM_STATUS_CONFIG: Record<
  string,
  { variant: BadgeVariant; label: string }
> = {
  pending: { variant: "info", label: "PENDING" },
  approved: { variant: "success", label: "APPROVED" },
  rejected: { variant: "destructive", label: "REJECTED" },
};

/** Badge variant for workflow history actions */
export const PR_WORKFLOW_ACTION_VARIANT: Record<string, BadgeVariant> = {
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
