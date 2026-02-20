import type { Metadata } from "next";
import { RoleForm } from "../_components/role-form";

export const metadata: Metadata = { title: "New Role" };

export default function NewRolePage() {
  return <RoleForm />;
}
