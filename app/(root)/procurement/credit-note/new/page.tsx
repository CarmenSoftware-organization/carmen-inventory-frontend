import type { Metadata } from "next";

import { CnForm } from "../_components/cn-form";

export const metadata: Metadata = { title: "New Credit Note" };

export default function NewCreditNotePage() {
  return <CnForm />;
}
