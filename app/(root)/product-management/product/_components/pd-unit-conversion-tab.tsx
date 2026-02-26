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
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LookupUnit } from "@/components/lookup/lookup-unit";
import { useUnit } from "@/hooks/use-unit";
import EmptyComponent from "@/components/empty-component";
import type { ProductFormInstance, ProductFormValues } from "@/types/product";

type UnitField = FieldArrayWithId<
  ProductFormValues,
  "order_units" | "ingredient_units",
  "id"
>;

/* ------------------------------------------------------------------ */
/* Cell components                                                     */
/* ------------------------------------------------------------------ */

const FromUnitCell = ({
  control,
  name,
  index,
  isOrder,
  inventoryUnitName,
  disabled,
  onUnitChange,
  usedIds,
}: {
  control: Control<ProductFormValues>;
  name: "order_units" | "ingredient_units";
  index: number;
  isOrder: boolean;
  inventoryUnitName: string;
  disabled: boolean;
  onUnitChange: (index: number, unitId: string) => void;
  usedIds: string[];
}) => {
  if (!isOrder) {
    return (
      <span className="px-2 text-[11px] text-muted-foreground">
        {inventoryUnitName}
      </span>
    );
  }
  return (
    <Controller
      control={control}
      name={`${name}.${index}.from_unit_id`}
      render={({ field }) => (
        <LookupUnit
          value={field.value}
          onValueChange={(v) => onUnitChange(index, v)}
          disabled={disabled}
          excludeIds={usedIds.filter((id) => id !== field.value)}
          size="xs"
        />
      )}
    />
  );
};

const ToUnitCell = ({
  control,
  name,
  index,
  isOrder,
  inventoryUnitName,
  disabled,
  onUnitChange,
  usedIds,
}: {
  control: Control<ProductFormValues>;
  name: "order_units" | "ingredient_units";
  index: number;
  isOrder: boolean;
  inventoryUnitName: string;
  disabled: boolean;
  onUnitChange: (index: number, unitId: string) => void;
  usedIds: string[];
}) => {
  if (isOrder) {
    return (
      <span className="px-2 text-[11px] text-muted-foreground">
        {inventoryUnitName}
      </span>
    );
  }
  return (
    <Controller
      control={control}
      name={`${name}.${index}.to_unit_id`}
      render={({ field }) => (
        <LookupUnit
          value={field.value}
          onValueChange={(v) => onUnitChange(index, v)}
          disabled={disabled}
          excludeIds={usedIds.filter((id) => id !== field.value)}
          size="xs"
        />
      )}
    />
  );
};

const ConversionPreview = ({
  control,
  name,
  index,
  unitMap,
}: {
  control: Control<ProductFormValues>;
  name: "order_units" | "ingredient_units";
  index: number;
  unitMap: Map<string, string>;
}) => {
  const fromId = useWatch({ control, name: `${name}.${index}.from_unit_id` });
  const toId = useWatch({ control, name: `${name}.${index}.to_unit_id` });
  const fromQty = useWatch({ control, name: `${name}.${index}.from_unit_qty` });
  const toQty = useWatch({ control, name: `${name}.${index}.to_unit_qty` });

  if (!fromId || !toId) return <span className="text-muted-foreground">—</span>;

  const fromName = unitMap.get(fromId) ?? "?";
  const toName = unitMap.get(toId) ?? "?";
  return (
    <span className="text-muted-foreground whitespace-nowrap">
      {fromQty} {fromName} = {toQty} {toName}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

interface UnitConversionTabProps {
  form: ProductFormInstance;
  name: "order_units" | "ingredient_units";
  label: string;
  isDisabled: boolean;
}

export default function UnitConversionTab({
  form,
  name,
  label,
  isDisabled,
}: UnitConversionTabProps) {
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name,
  });

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const isOrder = name === "order_units";
  const inventoryUnitId = useWatch({
    control: form.control,
    name: "inventory_unit_id",
  });
  const isUsedInRecipe = useWatch({
    control: form.control,
    name: "is_used_in_recipe",
  });

  /* ---- Resolve unit names ---- */
  const { data: unitData } = useUnit({ perpage: -1 });
  const unitMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of unitData?.data ?? []) {
      m.set(u.id, u.name);
    }
    return m;
  }, [unitData?.data]);

  const inventoryUnitName = unitMap.get(inventoryUnitId) ?? "—";

  /* ---- Collect used unit IDs for exclude filtering ---- */
  const watchedUnits = useWatch({ control: form.control, name });
  const usedSelectableIds = useMemo(() => {
    if (!watchedUnits) return [];
    if (isOrder) return watchedUnits.map((u) => u.from_unit_id).filter(Boolean);
    return watchedUnits.map((u) => u.to_unit_id).filter(Boolean);
  }, [watchedUnits, isOrder]);

  /* ---- Add disabled conditions ---- */
  const addDisabled =
    isDisabled || !inventoryUnitId || (!isOrder && !isUsedInRecipe);

  /* ---- Handle default (radio-like) ---- */
  const handleDefaultChange = (index: number) => {
    fields.forEach((field, i) => {
      if (i !== index && field.is_default) {
        update(i, { ...field, is_default: false });
      }
    });
    const current = fields[index];
    update(index, { ...current, is_default: true });
  };

  /* ---- Auto-sync: if from_unit === to_unit, sync qty ---- */
  const handleFromUnitChange = (index: number, unitId: string) => {
    form.setValue(`${name}.${index}.from_unit_id`, unitId);
    const toUnit = form.getValues(`${name}.${index}.to_unit_id`);
    if (unitId && unitId === toUnit) {
      const fromQty = form.getValues(`${name}.${index}.from_unit_qty`);
      form.setValue(`${name}.${index}.to_unit_qty`, fromQty);
    }
  };

  const handleToUnitChange = (index: number, unitId: string) => {
    form.setValue(`${name}.${index}.to_unit_id`, unitId);
    const fromUnit = form.getValues(`${name}.${index}.from_unit_id`);
    if (unitId && unitId === fromUnit) {
      const fromQty = form.getValues(`${name}.${index}.from_unit_qty`);
      form.setValue(`${name}.${index}.to_unit_qty`, fromQty);
    }
  };

  /* ---- Handle add ---- */
  const handleAdd = () => {
    append({
      from_unit_id: isOrder ? "" : inventoryUnitId,
      from_unit_qty: 1,
      to_unit_id: isOrder ? inventoryUnitId : "",
      to_unit_qty: 1,
      description: "",
      is_default: fields.length === 0,
      is_active: true,
    });
  };

  /* ---- Handle delete ---- */
  const handleDelete = (index: number) => {
    setDeleteIndex(index);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
    }
  };

  /* ---- Column definitions ---- */
  const columns = useMemo<ColumnDef<UnitField>[]>(() => {
    const indexCol: ColumnDef<UnitField> = {
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      size: 32,
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    };

    const dataCols: ColumnDef<UnitField>[] = [
      {
        accessorKey: "from_unit_id",
        header: "From Unit",
        cell: ({ row }) => (
          <FromUnitCell
            control={form.control}
            name={name}
            index={row.index}
            isOrder={isOrder}
            inventoryUnitName={inventoryUnitName}
            disabled={isDisabled}
            onUnitChange={handleFromUnitChange}
            usedIds={usedSelectableIds}
          />
        ),
        size: 160,
      },
      {
        accessorKey: "from_unit_qty",
        header: "From Qty",
        cell: ({ row }) => (
          <>
            <input
              type="hidden"
              {...form.register(`${name}.${row.index}.from_unit_qty`)}
            />
            <span className="px-2 text-[11px] text-right text-muted-foreground">
              {row.original.from_unit_qty}
            </span>
          </>
        ),
        size: 90,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
      },
      {
        accessorKey: "to_unit_id",
        header: "To Unit",
        cell: ({ row }) => (
          <ToUnitCell
            control={form.control}
            name={name}
            index={row.index}
            isOrder={isOrder}
            inventoryUnitName={inventoryUnitName}
            disabled={isDisabled}
            onUnitChange={handleToUnitChange}
            usedIds={usedSelectableIds}
          />
        ),
        size: 160,
      },
      {
        accessorKey: "to_unit_qty",
        header: "To Qty",
        cell: ({ row }) => (
          <Input
            type="number"
            step="any"
            min={1}
            className="h-6 text-[11px] md:text-[11px] text-right"
            disabled={isDisabled}
            {...form.register(`${name}.${row.index}.to_unit_qty`)}
          />
        ),
        size: 90,
        meta: { headerClassName: "text-right" },
      },
      {
        id: "conversion",
        header: "Conversion",
        cell: ({ row }) => (
          <ConversionPreview
            control={form.control}
            name={name}
            index={row.index}
            unitMap={unitMap}
          />
        ),
        enableSorting: false,
        size: 160,
      },
      {
        accessorKey: "is_default",
        header: "Default",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`${name}.${row.index}.is_default`}
            render={({ field: f }) => (
              <input
                type="radio"
                name={`${name}-default`}
                checked={f.value}
                onChange={() => handleDefaultChange(row.index)}
                disabled={isDisabled}
                className="h-3.5 w-3.5 accent-primary"
              />
            )}
          />
        ),
        enableSorting: false,
        size: 60,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorKey: "is_active",
        header: "Active",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`${name}.${row.index}.is_active`}
            render={({ field: f }) => (
              <Checkbox
                checked={f.value}
                onCheckedChange={f.onChange}
                disabled={isDisabled}
                className="size-3.5"
              />
            )}
          />
        ),
        enableSorting: false,
        size: 60,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
    ];

    const actionCol: ColumnDef<UnitField> = {
      id: "action",
      header: () => "",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => handleDelete(row.index)}
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
  }, [form, name, isOrder, isDisabled, inventoryUnitName, unitMap]);

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold border-b pb-2">
          {label}s{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({fields.length})
          </span>
        </h2>
        {!isDisabled && (
          <Button
            type="button"
            size="sm"
            disabled={addDisabled}
            onClick={handleAdd}
          >
            <Plus />
            Add {label}
          </Button>
        )}
      </div>

      {!isOrder && !isUsedInRecipe && (
        <p className="text-xs text-muted-foreground">
          Enable &quot;Used in Recipe&quot; in Product Info to add ingredient
          units.
        </p>
      )}

      <DataGrid
        table={table}
        recordCount={fields.length}
        tableLayout={{ dense: true, headerSeparator: true }}
        tableClassNames={{ base: "text-[11px]" }}
        emptyMessage={
          <EmptyComponent
            title={`No ${label.toLowerCase()}s`}
            description={`No ${label.toLowerCase()}s defined`}
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
        open={deleteIndex !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteIndex(null);
        }}
        title={`Remove ${label}`}
        description={`Are you sure you want to remove this ${label.toLowerCase()}?`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
