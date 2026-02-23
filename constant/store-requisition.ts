type BadgeVariant =
  | "outline"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export const SR_STATUS_CONFIG: Record<
  string,
  { variant: BadgeVariant; label: string }
> = {
  draft: { variant: "secondary", label: "DRAFT" },
  submitted: { variant: "info", label: "SUBMITTED" },
  approved: { variant: "success", label: "APPROVED" },
  rejected: { variant: "destructive", label: "REJECTED" },
};

export const STORE_REQUISITION_STATUS_OPTIONS = [
  { label: "Draft", value: "doc_status|string:draft" },
  { label: "Submitted", value: "doc_status|string:submitted" },
  { label: "Approved", value: "doc_status|string:approved" },
  { label: "Rejected", value: "doc_status|string:rejected" },
];
