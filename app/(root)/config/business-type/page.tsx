import type { Metadata } from "next";
import BusinessTypeComponent from "./_components/business-type-component";

export const metadata: Metadata = { title: "Business Types" };

export default function BusinessTypePage() {
  return <BusinessTypeComponent />;
}
