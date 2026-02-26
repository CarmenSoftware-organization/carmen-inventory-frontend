"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useDepartmentById } from "@/hooks/use-department";
import { DepartmentForm } from "../_components/department-form";

export default createEditPage({
  useById: useDepartmentById,
  notFoundMessage: "Department not found",
  render: (department) => <DepartmentForm department={department} />,
});
