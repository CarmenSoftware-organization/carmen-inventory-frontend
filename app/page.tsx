import type { Metadata } from "next";
import HomeComponent from "@/components/home-component";

export const metadata: Metadata = { title: "Home" };

export default function WelcomePage() {
  return <HomeComponent />;
}
