import type { Metadata } from "next";
import DepartmentComponent from "./_components/department-component";

export const metadata: Metadata = { title: "Departments" };

export default function DepartmentPage() {
  return <DepartmentComponent />;
}
