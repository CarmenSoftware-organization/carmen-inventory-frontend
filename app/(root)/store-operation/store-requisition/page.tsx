import type { Metadata } from "next";
import StoreRequisitionComponent from "./_components/sr-component";

export const metadata: Metadata = { title: "Store Requisitions" };

export default function StoreRequisitionPage() {
  return <StoreRequisitionComponent />;
}
