import type { Metadata } from "next";
import ExchangeRateComponent from "./_components/exchange-rate-component";

export const metadata: Metadata = { title: "Exchange Rates" };

export default function ExchangeRatePage() {
  return <ExchangeRateComponent />;
}
