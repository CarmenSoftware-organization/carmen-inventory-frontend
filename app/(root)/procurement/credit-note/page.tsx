import type { Metadata } from "next";

import CnComponent from "./_components/cn-component";

export const metadata: Metadata = { title: "Credit Notes" };

export default function CreditNotePage() {
  return <CnComponent />;
}
