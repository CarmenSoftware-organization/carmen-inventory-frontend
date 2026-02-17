import { useState, useMemo } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ProductFormInstance } from "@/types/product";
import type { Location } from "@/types/location";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Search } from "lucide-react";
import { INVENTORY_TYPE } from "@/constant/location";
import { DeleteDialog } from "@/components/ui/delete-dialog";

interface LocationsTabProps {
  form: ProductFormInstance;
  isDisabled: boolean;
  allLocations: Location[];
}

export default function LocationsTab({
  form,
  isDisabled,
  allLocations,
}: LocationsTabProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  });

  const [search, setSearch] = useState("");
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  const isUsedInRecipe = form.watch("is_used_in_recipe");
  const isSoldDirectly = form.watch("is_sold_directly");

  /* ---- Filter locations by product flags ---- */
  const filteredLocations = useMemo(() => {
    const assignedIds = new Set(fields.map((f) => f.location_id));

    return allLocations.filter((loc) => {
      if (assignedIds.has(loc.id)) return false;

      if (isUsedInRecipe && loc.location_type !== INVENTORY_TYPE.INVENTORY) {
        return false;
      }
      if (
        isSoldDirectly &&
        ![
          INVENTORY_TYPE.DIRECT,
          INVENTORY_TYPE.CONSIGNMENT,
          INVENTORY_TYPE.INVENTORY,
        ].includes(loc.location_type)
      ) {
        return false;
      }

      return true;
    });
  }, [allLocations, fields, isUsedInRecipe, isSoldDirectly]);

  /* ---- Build display rows (new on top, then existing) ---- */
  const displayRows = useMemo(() => {
    return fields.map((field, index) => {
      const loc = allLocations.find((l) => l.id === field.location_id);
      const isNew = !field.id;
      return { field, index, loc, isNew };
    });
  }, [fields, allLocations]);

  /* ---- Search filter ---- */
  const visibleRows = useMemo(() => {
    if (!search) return displayRows;
    const q = search.toLowerCase();
    return displayRows.filter(({ loc }) => {
      if (!loc) return false;
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.code.toLowerCase().includes(q) ||
        loc.location_type.toLowerCase().includes(q) ||
        (loc.delivery_point?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [displayRows, search]);

  const addLocation = (locationId: string) => {
    if (locationId === "none") return;
    append({ location_id: locationId });
  };

  const handleRemove = (index: number) => {
    const field = fields[index];
    if (field.id) {
      // Existing row — confirm
      setDeleteIdx(index);
    } else {
      // New row — remove immediately
      remove(index);
    }
  };

  const confirmDelete = () => {
    if (deleteIdx !== null) {
      remove(deleteIdx);
      setDeleteIdx(null);
    }
  };

  const locationTypeBadge = (type: string) => {
    const map: Record<string, "info" | "warning" | "secondary"> = {
      inventory: "info",
      direct: "warning",
      consignment: "secondary",
    };
    return <Badge variant={map[type] ?? "secondary"}>{type}</Badge>;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Locations{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({fields.length})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="h-8 w-48 pl-7 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {!isDisabled && (
            <Select onValueChange={addLocation}>
              <SelectTrigger className="h-8 w-60 text-sm">
                <SelectValue placeholder="Add location..." />
              </SelectTrigger>
              <SelectContent>
                {filteredLocations.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No locations available
                  </SelectItem>
                ) : (
                  filteredLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.code} — {loc.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground">No locations assigned</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-1.5 text-left font-medium w-12">#</th>
                <th className="px-3 py-1.5 text-left font-medium">Code</th>
                <th className="px-3 py-1.5 text-left font-medium">Name</th>
                <th className="px-3 py-1.5 text-left font-medium">Type</th>
                <th className="px-3 py-1.5 text-left font-medium">
                  Delivery Point
                </th>
                <th className="px-3 py-1.5 text-center font-medium w-16">
                  Status
                </th>
                {!isDisabled && <th className="px-3 py-1.5 w-10" />}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ field, index, loc, isNew }) => (
                <tr
                  key={field.id ?? `new-${index}`}
                  className={`border-b last:border-0 ${isNew ? "bg-green-50/50" : ""}`}
                >
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-3 py-1.5 font-medium">
                    {loc?.code ?? "—"}
                  </td>
                  <td className="px-3 py-1.5">{loc?.name ?? "—"}</td>
                  <td className="px-3 py-1.5">
                    {loc ? locationTypeBadge(loc.location_type) : "—"}
                  </td>
                  <td className="px-3 py-1.5">
                    {loc?.delivery_point?.name ?? "—"}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    {loc ? (
                      <Badge
                        variant={loc.is_active ? "success" : "secondary"}
                      >
                        {loc.is_active ? "Active" : "Inactive"}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  {!isDisabled && (
                    <td className="px-2 py-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemove(index)}
                      >
                        <X />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteDialog
        open={deleteIdx !== null}
        onOpenChange={(open) => !open && setDeleteIdx(null)}
        title="Remove Location"
        description="Are you sure you want to remove this location?"
        isPending={false}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
