"use no memo";

import { useState, useMemo } from "react";
import { useFieldArray, Controller, type UseFormReturn, type FieldArrayWithId } from "react-hook-form";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LookupTaxProfile } from "@/components/lookup/lookup-tax-profile";
import EmptyComponent from "@/components/empty-component";
import type { GrnFormValues } from "./grn-form-schema";
import { EMPTY_EXTRA_COST } from "./grn-form-schema";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const INPUT_CLS = "h-6 text-[11px] md:text-[11px] text-right";

const ALLOCATE_OPTIONS = [
  { value: "by_qty", label: "By Quantity" },
  { value: "by_value", label: "By Value" },
  { value: "by_weight", label: "By Weight" },
];

const TAX_TYPE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "included", label: "Included" },
  { value: "excluded", label: "Excluded" },
];

type ExtraCostField = FieldArrayWithId<
  GrnFormValues,
  "extra_cost_details",
  "id"
>;

interface GrnExtraCostFieldsProps {
  readonly form: UseFormReturn<GrnFormValues>;
  readonly disabled: boolean;
}

export function GrnExtraCostFields({
  form,
  disabled,
}: GrnExtraCostFieldsProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    fields: costFields,
    append: appendCost,
    remove: removeCost,
  } = useFieldArray({ control: form.control, name: "extra_cost_details" });

  const columns = useMemo<ColumnDef<ExtraCostField>[]>(() => {
    const indexCol: ColumnDef<ExtraCostField> = {
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

    const dataCols: ColumnDef<ExtraCostField>[] = [
      {
        accessorKey: "extra_cost_type_id",
        header: "Type ID",
        cell: ({ row }) => (
          <Input
            className="h-6 text-[11px] md:text-[11px]"
            disabled={disabled}
            {...form.register(
              `extra_cost_details.${row.index}.extra_cost_type_id`,
            )}
          />
        ),
        size: 160,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <Input
            type="number"
            min={0}
            step="0.01"
            className={INPUT_CLS}
            disabled={disabled}
            {...form.register(`extra_cost_details.${row.index}.amount`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 100,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "tax_profile_id",
        header: "Tax",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`extra_cost_details.${row.index}.tax_profile_id`}
            render={({ field }) => (
              <LookupTaxProfile
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full text-[11px]"
              />
            )}
          />
        ),
        size: 130,
      },
      {
        accessorKey: "tax_type",
        header: "Tax Type",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`extra_cost_details.${row.index}.tax_type`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className="h-6 w-full text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAX_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ),
        size: 100,
      },
      {
        accessorKey: "tax_amount",
        header: "Tax Amt",
        cell: ({ row }) => (
          <Input
            type="number"
            step="0.01"
            className={INPUT_CLS}
            disabled={disabled}
            {...form.register(`extra_cost_details.${row.index}.tax_amount`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 90,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => (
          <Input
            type="number"
            step="0.01"
            className={INPUT_CLS}
            disabled={disabled}
            {...form.register(`extra_cost_details.${row.index}.total_amount`, {
              valueAsNumber: true,
            })}
          />
        ),
        size: 100,
        meta: { headerClassName: "text-right" },
      },
      {
        accessorKey: "is_tax_adjustment",
        header: "Tax Adj",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`extra_cost_details.${row.index}.is_tax_adjustment`}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        ),
        size: 60,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
    ];

    const actionCol: ColumnDef<ExtraCostField> = {
      id: "action",
      header: () => "",
      cell: ({ row }: { row: { index: number } }) => (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setDeleteIndex(row.index)}
        >
          <Trash2 />
        </Button>
      ),
      enableSorting: false,
      size: 40,
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
    };

    return [indexCol, ...dataCols, ...(disabled ? [] : [actionCol])];
  }, [form, disabled]);

  const table = useReactTable({
    data: costFields,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 pt-4">
      {/* Extra Cost Header */}
      <div className="grid max-w-2xl grid-cols-3 gap-3">
        <Field>
          <FieldLabel className="text-xs">Name</FieldLabel>
          <Input
            className="h-9 text-sm"
            disabled={disabled}
            {...form.register("extra_cost_name")}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Allocation Type</FieldLabel>
          <Controller
            control={form.control}
            name="allocate_extracost_type"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALLOCATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field>
          <FieldLabel className="text-xs">Note</FieldLabel>
          <Input
            className="h-9 text-sm"
            disabled={disabled}
            {...form.register("extra_cost_note")}
          />
        </Field>
      </div>

      {/* Extra Cost Details Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Extra Cost Details</h2>
          {!disabled && (
            <Button
              type="button"
              size="xs"
              onClick={() => appendCost({ ...EMPTY_EXTRA_COST })}
            >
              <Plus /> Add Cost
            </Button>
          )}
        </div>

        <DataGrid
          table={table}
          recordCount={costFields.length}
          tableLayout={{ dense: true }}
          tableClassNames={{ base: "text-[11px]" }}
          emptyMessage={
            <EmptyComponent
              icon={DollarSign}
              title="No Extra Costs"
              description="Add extra costs if applicable."
              content={
                !disabled && (
                  <Button
                    type="button"
                    size="xs"
                    onClick={() => appendCost({ ...EMPTY_EXTRA_COST })}
                  >
                    <Plus /> Add Cost
                  </Button>
                )
              }
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
      </div>

      <DeleteDialog
        open={deleteIndex !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteIndex(null);
        }}
        title="Remove Extra Cost"
        description={`Are you sure you want to remove this extra cost item?`}
        onConfirm={() => {
          if (deleteIndex === null) return;
          removeCost(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
