"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useProductById } from "@/hooks/use-product";
import { ProductForm } from "../_components/pd-form";

export default createEditPage({
  useById: useProductById,
  notFoundMessage: "Product not found",
  render: (product) => <ProductForm product={product} />,
});
