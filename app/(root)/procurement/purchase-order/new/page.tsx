import type { Metadata } from "next";

import { PoForm } from "../_components/po-form";

export const metadata: Metadata = { title: "New Purchase Order" };

export default function NewPurchaseOrderPage() {
  return <PoForm />;
}
