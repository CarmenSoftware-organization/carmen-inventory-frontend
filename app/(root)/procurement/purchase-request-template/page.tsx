import type { Metadata } from "next";

import PrtComponent from "./_components/prt-component";

export const metadata: Metadata = { title: "Purchase Request Templates" };

export default function PurchaseRequestTemplatePage() {
  return <PrtComponent />;
}
