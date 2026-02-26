"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useRoleById } from "@/hooks/use-role";
import { RoleForm } from "../_components/role-form";

export default createEditPage({
  useById: useRoleById,
  notFoundMessage: "Role not found",
  render: (role) => <RoleForm role={role} />,
});
