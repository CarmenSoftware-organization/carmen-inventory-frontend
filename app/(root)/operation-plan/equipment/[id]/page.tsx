"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useEquipmentById } from "@/hooks/use-equipment";
import { EquipmentForm } from "../_components/equipment-form";

export default createEditPage({
  useById: useEquipmentById,
  notFoundMessage: "Equipment not found",
  render: (equipment) => <EquipmentForm equipment={equipment} />,
});
