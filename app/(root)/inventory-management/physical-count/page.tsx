import type { Metadata } from "next";
import PcComponent from "./_components/pc-component";

export const metadata: Metadata = { title: "Physical Counts" };

export default function PhysicalCountPage() {
  return <PcComponent />;
}
