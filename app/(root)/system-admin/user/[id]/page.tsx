"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useUserById } from "@/hooks/use-user";
import { UserAssignedForm } from "../_components/user-assigned-form";

export default createEditPage({
  useById: useUserById,
  notFoundMessage: "User not found",
  render: (user) => <UserAssignedForm user={user} />,
});
