import type { Metadata } from "next";

import RequestPriceListComponent from "./_components/rpl-component";

export const metadata: Metadata = { title: "Request Price Lists" };

export default function RequestPriceListPage() {
  return <RequestPriceListComponent />;
}
