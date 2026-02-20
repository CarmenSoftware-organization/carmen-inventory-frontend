import type { Metadata } from "next";
import CurrencyComponent from "./_components/currency-component";

export const metadata: Metadata = { title: "Currencies" };

export default function CurrencyPage() {
  return <CurrencyComponent />;
}
