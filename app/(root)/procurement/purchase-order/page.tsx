import type { Metadata } from "next";

import PoComponent from "./_components/po-component";

export const metadata: Metadata = { title: "Purchase Orders" };

export default function PurchaseOrderPage() {
  return <PoComponent />;
}
