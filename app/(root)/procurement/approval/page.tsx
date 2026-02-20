import type { Metadata } from "next";

import ApprovalComponent from "./_components/approval-component";

export const metadata: Metadata = { title: "Approvals" };

export default function ApprovalPage() {
  return <ApprovalComponent />;
}
