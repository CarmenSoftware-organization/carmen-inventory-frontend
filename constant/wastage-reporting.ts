type BadgeVariant =
  | "outline"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export const WR_STATUS_CONFIG: Record<
  string,
  { variant: BadgeVariant; label: string }
> = {
  pending: { variant: "secondary", label: "PENDING" },
  approved: { variant: "success", label: "APPROVED" },
  rejected: { variant: "destructive", label: "REJECTED" },
};

export const WASTAGE_REPORT_STATUS_OPTIONS = [
  { label: "Pending", value: "status|string:pending" },
  { label: "Approved", value: "status|string:approved" },
  { label: "Rejected", value: "status|string:rejected" },
];
