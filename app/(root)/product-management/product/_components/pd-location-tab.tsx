"use no memo";

import { useState, useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldArrayWithId,
} from "react-hook-form";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LookupLocation } from "@/components/lookup/lookup-location";
import { useLocation } from "@/hooks/use-location";
import EmptyComponent from "@/components/empty-component";
import type { ProductFormInstance, ProductFormValues } from "@/types/product";
import type { Location } from "@/types/location";

/* ------------------------------------------------------------------ */
/* Shared cell props                                                   */
/* ------------------------------------------------------------------ */

interface LocationCellProps {
  control: Control<ProductFormValues>;
  index: number;
  locationMap: Map<string, Location>;
}

const useLocationWatch = ({
  control,
  index,
  locationMap,
}: LocationCellProps) => {
  const locationId =
    useWatch({ control, name: `locations.${index}.location_id` }) ?? "";
  return locationMap.get(locationId) ?? null;
};

/* ------------------------------------------------------------------ */
/* Cell components — uses useWatch for live form value                  */
/* ------------------------------------------------------------------ */

const LocationNameCell = ({
  control,
  index,
  isDisabled,
  locationMap,
  assignedIds,
}: LocationCellProps & { isDisabled: boolean; assignedIds: string[] }) => {
  const locationId =
    useWatch({ control, name: `locations.${index}.location_id` }) ?? "";
  const loc = locationMap.get(locationId);

  if (isDisabled || locationId) {
    return (
      <span className="px-2 text-[11px]">
        {loc ? `${loc.code} — ${loc.name}` : "—"}
      </span>
    );
  }

  return (
    <Controller
      control={control}
      name={`locations.${index}.location_id`}
      render={({ field }) => (
        <LookupLocation
          value={field.value}
          onValueChange={field.onChange}
          excludeIds={assignedIds.filter((id) => id !== field.value)}
          placeholder="Select location..."
          className="w-full"
          size="xs"
        />
      )}
    />
  );
};

const TYPE_VARIANT: Record<string, "info" | "warning" | "secondary"> = {
  inventory: "info",
  direct: "warning",
  consignment: "secondary",
};

const LocationTypeCell = (props: LocationCellProps) => {
  const loc = useLocationWatch(props);
  if (!loc) return "—";
  return (
    <Badge variant={TYPE_VARIANT[loc.location_type] ?? "secondary"}>
      {loc.location_type}
    </Badge>
  );
};

const LocationDeliveryPointCell = (props: LocationCellProps) => {
  const loc = useLocationWatch(props);
  return loc?.delivery_point?.name ?? "—";
};

const LocationStatusCell = (props: LocationCellProps) => {
  const loc = useLocationWatch(props);
  if (!loc) return "—";
  return (
    <Badge variant={loc.is_active ? "success" : "secondary"}>
      {loc.is_active ? "Active" : "Inactive"}
    </Badge>
  );
};

type LocationField = FieldArrayWithId<ProductFormValues, "locations", "id">;

interface LocationRow {
  field: LocationField;
  fieldIndex: number;
}

interface LocationsTabProps {
  form: ProductFormInstance;
  isDisabled: boolean;
}

export default function LocationsTab({ form, isDisabled }: LocationsTabProps) {
  const { data: locationData } = useLocation({ perpage: -1 });
  const allLocations = useMemo(
    () => locationData?.data?.filter((l) => l.is_active) ?? [],
    [locationData?.data],
  );

  const locationMap = useMemo(() => {
    const m = new Map<string, (typeof allLocations)[number]>();
    for (const loc of allLocations) {
      m.set(loc.id, loc);
    }
    return m;
  }, [allLocations]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  });

  const [search, setSearch] = useState("");
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  const assignedIds = useMemo(() => fields.map((f) => f.location_id), [fields]);

  const tableData = useMemo<LocationRow[]>(() => {
    const rows: LocationRow[] = fields.map((field, index) => ({
      field,
      fieldIndex: index,
    }));
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(({ field }) => {
      if (!field.location_id) return true;
      const loc = locationMap.get(field.location_id);
      if (!loc) return false;
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.code.toLowerCase().includes(q) ||
        loc.location_type.toLowerCase().includes(q) ||
        (loc.delivery_point?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [fields, search, locationMap]);

  const handleAdd = () => {
    append({ location_id: "" });
  };

  const confirmDelete = () => {
    if (deleteIdx !== null) {
      remove(deleteIdx);
      setDeleteIdx(null);
    }
  };

  const columns = useMemo<ColumnDef<LocationRow>[]>(() => {
    const indexCol: ColumnDef<LocationRow> = {
      id: "index",
      header: "#",
      cell: ({ row }) => row.original.fieldIndex + 1,
      enableSorting: false,
      size: 32,
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    };

    const cellProps = (row: { original: LocationRow }): LocationCellProps => ({
      control: form.control,
      index: row.original.fieldIndex,
      locationMap,
    });

    const dataCols: ColumnDef<LocationRow>[] = [
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => (
          <LocationNameCell
            {...cellProps(row)}
            isDisabled={isDisabled}
            assignedIds={assignedIds}
          />
        ),
        size: 260,
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => <LocationTypeCell {...cellProps(row)} />,
        size: 120,
      },
      {
        id: "delivery_point",
        header: "Delivery Point",
        cell: ({ row }) => <LocationDeliveryPointCell {...cellProps(row)} />,
        size: 160,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <LocationStatusCell {...cellProps(row)} />,
        enableSorting: false,
        size: 80,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
    ];

    const actionCol: ColumnDef<LocationRow> = {
      id: "action",
      header: () => "",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setDeleteIdx(row.original.fieldIndex)}
        >
          <X />
        </Button>
      ),
      enableSorting: false,
      size: 40,
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
    };

    return [indexCol, ...dataCols, ...(isDisabled ? [] : [actionCol])];
  }, [isDisabled, locationMap, form.control, assignedIds]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold border-b pb-2">
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
              className="h-8 w-64 pl-7 text-xs placeholder:text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {!isDisabled && (
            <Button type="button" size="sm" onClick={handleAdd}>
              <Plus />
              Add Location
            </Button>
          )}
        </div>
      </div>

      <DataGrid
        table={table}
        recordCount={fields.length}
        tableLayout={{ dense: true, headerSeparator: true }}
        tableClassNames={{ base: "text-[11px]" }}
        emptyMessage={
          <EmptyComponent
            title="No locations"
            description="No locations assigned"
          />
        }
      >
        <DataGridContainer>
          <ScrollArea className="w-full pb-4">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
      </DataGrid>

      <DeleteDialog
        open={deleteIdx !== null}
        onOpenChange={(open) => !open && setDeleteIdx(null)}
        title="Remove Location"
        description="Are you sure you want to remove this location?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
