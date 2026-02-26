"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useCuisineById } from "@/hooks/use-cuisine";
import { CuisineForm } from "../_components/cuisine-form";

export default createEditPage({
  useById: useCuisineById,
  notFoundMessage: "Cuisine not found",
  render: (cuisine) => <CuisineForm cuisine={cuisine} />,
});
