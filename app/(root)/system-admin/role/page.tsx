import type { Metadata } from "next";
import RoleComponent from "./_components/role-component";

export const metadata: Metadata = { title: "Roles" };

export default function RolePage() {
  return <RoleComponent />;
}
