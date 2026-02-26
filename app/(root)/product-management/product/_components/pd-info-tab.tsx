"use no memo";

import { useState, useMemo } from "react";
import type { ProductFormInstance, ProductFormValues } from "@/types/product";
import { PRODUCT_ATTRIBUTE_LABELS } from "@/types/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Controller,
  useFieldArray,
  type FieldArrayWithId,
} from "react-hook-form";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Plus, X } from "lucide-react";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import EmptyComponent from "@/components/empty-component";

type InfoField = FieldArrayWithId<ProductFormValues, "info", "id">;

interface ProductInfoTabProps {
  form: ProductFormInstance;
  isDisabled: boolean;
}

export default function ProductInfoTab({
  form,
  isDisabled,
}: ProductInfoTabProps) {
  const {
    fields: infoFields,
    append: appendInfo,
    remove: removeInfo,
  } = useFieldArray({ control: form.control, name: "info" });

  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  const confirmDelete = () => {
    if (deleteIdx !== null) {
      removeInfo(deleteIdx);
      setDeleteIdx(null);
    }
  };

  /* ---- Column definitions for Additional Info ---- */
  const columns = useMemo<ColumnDef<InfoField>[]>(() => {
    const indexCol: ColumnDef<InfoField> = {
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

    const dataCols: ColumnDef<InfoField>[] = [
      {
        accessorKey: "label",
        header: "Label",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`info.${row.index}.label`}
            render={({ field: labelField }) => (
              <Select
                value={labelField.value || "custom"}
                onValueChange={(v) =>
                  labelField.onChange(v === "custom" ? "" : v)
                }
                disabled={isDisabled}
              >
                <SelectTrigger className="h-6 text-[11px] border-0 shadow-none bg-transparent">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_ATTRIBUTE_LABELS.map((lbl) => (
                    <SelectItem key={lbl} value={lbl}>
                      {lbl.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        ),
        size: 180,
      },
      {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => (
          <Input
            placeholder="Value"
            className="h-6 text-[11px] md:text-[11px] border-0 shadow-none bg-transparent px-1"
            disabled={isDisabled}
            {...form.register(`info.${row.index}.value`)}
          />
        ),
        size: 200,
      },
      {
        accessorKey: "data_type",
        header: "Type",
        cell: ({ row }) => (
          <Controller
            control={form.control}
            name={`info.${row.index}.data_type`}
            render={({ field: dtField }) => (
              <Select
                value={dtField.value}
                onValueChange={dtField.onChange}
                disabled={isDisabled}
              >
                <SelectTrigger className="h-6 text-[11px] border-0 shadow-none bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        ),
        size: 100,
      },
    ];

    const actionCol: ColumnDef<InfoField> = {
      id: "action",
      header: () => "",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setDeleteIdx(row.index)}
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
  }, [form, isDisabled]);

  const table = useReactTable({
    data: infoFields,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-w-2xl space-y-6">
      {/* ── Pricing & Identification ── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold border-b pb-2">Pricing & Identification</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Field>
              <FieldLabel required>
                Price
              </FieldLabel>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                className="h-8 text-sm text-right"
                disabled={isDisabled}
                {...form.register("price")}
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="product-barcode"
               
                required
              >
                Barcode
              </FieldLabel>
              <Input
                id="product-barcode"
                placeholder="e.g. 8851234567890"
                className="h-8 text-sm"
                disabled={isDisabled}
                {...form.register("barcode")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="product-sku" required>
                SKU
              </FieldLabel>
              <Input
                id="product-sku"
                placeholder="e.g. ESP-250G-TH"
                className="h-8 text-sm"
                disabled={isDisabled}
                {...form.register("sku")}
              />
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Quality Control ── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold border-b pb-2">Quality Control</h2>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel required>
                Price Deviation Limit (%)
              </FieldLabel>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="h-8 text-sm pr-8 text-right"
                  disabled={isDisabled}
                  {...form.register("price_deviation_limit")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </Field>

            <Field>
              <FieldLabel required>
                Qty Deviation Limit (%)
              </FieldLabel>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="h-8 text-sm pr-8 text-right"
                  disabled={isDisabled}
                  {...form.register("qty_deviation_limit")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Product Flags ── */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold border-b pb-2">Product Flags</h2>
        <div className="flex items-center gap-6">
          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_used_in_recipe"
              render={({ field }) => (
                <Checkbox
                  id="product-is-used-in-recipe"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel htmlFor="product-is-used-in-recipe">
              Used in Recipe
            </FieldLabel>
          </Field>

          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_sold_directly"
              render={({ field }) => (
                <Checkbox
                  id="product-is-sold-directly"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel htmlFor="product-is-sold-directly">
              Sold Directly
            </FieldLabel>
          </Field>
        </div>
      </section>

      {/* ── Additional Info ── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold border-b pb-2">
            Additional Info{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({infoFields.length})
            </span>
          </h2>
          {!isDisabled && (
            <Button
              type="button"
              size="xs"
              onClick={() =>
                appendInfo({ label: "", value: "", data_type: "string" })
              }
            >
              <Plus />
              Add
            </Button>
          )}
        </div>

        {isDisabled && infoFields.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {infoFields.map((field, index) => {
              const label = form.getValues(`info.${index}.label`);
              const value = form.getValues(`info.${index}.value`);
              return (
                <div key={field.id} className="flex items-baseline gap-2">
                  <span className="text-xs font-medium capitalize">
                    {label.replaceAll("_", " ")}:
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {value || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <DataGrid
            table={table}
            recordCount={infoFields.length}
            tableLayout={{ dense: true, headerSeparator: true }}
            tableClassNames={{ base: "text-[11px]" }}
            emptyMessage={
              <EmptyComponent
                icon={Info}
                title="No additional info"
                description="No additional info defined"
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
        )}
      </section>

      <DeleteDialog
        open={deleteIdx !== null}
        onOpenChange={(open) => !open && setDeleteIdx(null)}
        title="Remove Info"
        description="Are you sure you want to remove this info entry?"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
