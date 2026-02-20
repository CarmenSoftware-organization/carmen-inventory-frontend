import type { Metadata } from "next";
import InventoryAdjustmentComponent from "./_components/inventory-adjustment-component";

export const metadata: Metadata = { title: "Inventory Adjustments" };

export default function InventoryAdjustmentPage() {
  return <InventoryAdjustmentComponent />;
}
