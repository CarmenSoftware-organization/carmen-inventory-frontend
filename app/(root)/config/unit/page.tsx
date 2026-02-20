import type { Metadata } from "next";
import UnitComponent from "./_components/unit-component";

export const metadata: Metadata = { title: "Units" };

export default function UnitPage() {
  return <UnitComponent />;
}
