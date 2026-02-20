import type { Metadata } from "next";
import UserComponent from "./_components/user-component";

export const metadata: Metadata = { title: "Users" };

export default function UserPage() {
  return <UserComponent />;
}
