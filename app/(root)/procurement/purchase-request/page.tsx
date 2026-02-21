import type { Metadata } from "next";

import PurchaseRequestComponent from "./_components/pr-component";

export const metadata: Metadata = { title: "Purchase Requests" };

export default function PurchaseRequestPage() {
  return <PurchaseRequestComponent />;
}
