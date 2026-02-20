import type { Metadata } from "next";
import { DepartmentForm } from "../_components/department-form";

export const metadata: Metadata = { title: "New Department" };

export default function NewDepartmentPage() {
  return <DepartmentForm />;
}
