import type { Metadata } from "next";
import TaxProfileComponent from "./_components/tax-profile-component";

export const metadata: Metadata = { title: "Tax Profiles" };

export default function TaxProfilePage() {
  return <TaxProfileComponent />;
}
