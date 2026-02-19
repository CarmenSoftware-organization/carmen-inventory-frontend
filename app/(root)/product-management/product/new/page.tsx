import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ProductForm } from "../_components/pd-form";

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductForm />
    </Suspense>
  );
}
