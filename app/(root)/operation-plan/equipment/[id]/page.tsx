"use client";

import { use } from "react";
import { useEquipmentById } from "@/hooks/use-equipment";
import { EquipmentForm } from "../_components/equipment-form";
import { ErrorState } from "@/components/ui/error-state";

export default function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: equipment, isLoading, error, refetch } = useEquipmentById(id);

  if (isLoading)
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!equipment) return <ErrorState message="Equipment not found" />;

  return <EquipmentForm equipment={equipment} />;
}
