import type { Metadata } from "next";
import LocationComponent from "./_components/location-component";

export const metadata: Metadata = { title: "Locations" };

export default function LocationPage() {
  return <LocationComponent />;
}
