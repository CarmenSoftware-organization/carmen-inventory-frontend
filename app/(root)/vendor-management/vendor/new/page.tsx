import type { Metadata } from "next";

import { VendorForm } from "../_components/vendor-form";

export const metadata: Metadata = { title: "New Vendor" };

export default function NewVendorPage() {
  return <VendorForm />;
}
