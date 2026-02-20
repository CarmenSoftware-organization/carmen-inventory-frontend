import type { Metadata } from "next";
import { StoreRequisitionForm } from "../_components/sr-form";

export const metadata: Metadata = { title: "New Store Requisition" };

export default function NewStoreRequisitionPage() {
  return <StoreRequisitionForm />;
}
