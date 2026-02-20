import type { Metadata } from "next";

import VendorComponent from "./_components/vendor-component";

export const metadata: Metadata = { title: "Vendors" };

export default function VendorPage() {
  return <VendorComponent />;
}
