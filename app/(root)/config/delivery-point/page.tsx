import type { Metadata } from "next";
import DeliveryPointComponent from "./_components/delivery-point-component";

export const metadata: Metadata = { title: "Delivery Points" };

export default function DeliveryPointPage() {
  return <DeliveryPointComponent />;
}
