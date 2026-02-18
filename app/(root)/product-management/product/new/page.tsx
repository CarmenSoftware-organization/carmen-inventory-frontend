import { Suspense } from "react";
import { ProductForm } from "../_components/pd-form";

export default function NewProductPage() {
  return (
    <Suspense>
      <ProductForm />
    </Suspense>
  );
}
