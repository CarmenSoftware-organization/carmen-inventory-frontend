"use client";

import { createEditPage } from "@/components/create-edit-page";
import { useLocationById } from "@/hooks/use-location";
import { LocationForm } from "../_components/location-form";

export default createEditPage({
  useById: useLocationById,
  notFoundMessage: "Location not found",
  render: (location) => <LocationForm location={location} />,
});
