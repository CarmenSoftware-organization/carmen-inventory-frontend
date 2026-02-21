import type { Metadata } from "next";

import { PrtForm } from "../_components/prt-form";

export const metadata: Metadata = { title: "New Purchase Request Template" };

export default function NewPurchaseRequestTemplatePage() {
  return <PrtForm />;
}
