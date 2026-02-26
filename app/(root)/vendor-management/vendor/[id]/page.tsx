"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useVendorById } from "@/hooks/use-vendor";
import { VendorForm } from "../_components/vendor-form";

export default createEditPage({
  useById: useVendorById,
  notFoundMessage: "Vendor not found",
  render: (vendor) => <VendorForm vendor={vendor} />,
});
