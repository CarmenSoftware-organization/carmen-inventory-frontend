import type { Metadata } from "next";

import { GrnForm } from "../_components/grn-form";

export const metadata: Metadata = { title: "New Goods Receive Note" };

export default function NewGoodsReceiveNotePage() {
  return <GrnForm />;
}
