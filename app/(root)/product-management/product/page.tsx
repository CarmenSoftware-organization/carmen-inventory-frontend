import type { Metadata } from "next";
import ProductComponent from "./_components/pd-component";

export const metadata: Metadata = { title: "Products" };

export default function ProductPage() {
  return <ProductComponent />;
}
