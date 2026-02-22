import type { Metadata } from "next";
import InventoryAdjustmentComponent from "./_components/inv-adj-component";

export const metadata: Metadata = { title: "Inventory Adjustments" };

export default function InventoryAdjustmentPage() {
  return <InventoryAdjustmentComponent />;
}
