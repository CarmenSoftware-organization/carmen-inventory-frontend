import type { Metadata } from "next";

import { RequestPriceListForm } from "../_components/rpl-form";

export const metadata: Metadata = { title: "New Request Price List" };

export default function NewRequestPriceListPage() {
  return <RequestPriceListForm />;
}
