import { Metadata } from "next";
import StockReplComponent from "./_components/stock-repl-component";

export const metadata: Metadata = { title: "Stock Replenishment" };

export default function StockReplenishmentPage() {
  return <StockReplComponent />;
}
