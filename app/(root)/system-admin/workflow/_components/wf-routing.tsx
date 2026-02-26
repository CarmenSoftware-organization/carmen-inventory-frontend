"use client";

import { useState, useMemo } from "react";
import {
  Controller,
  useWatch,
  type UseFormReturn,
  type UseFieldArrayReturn,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useDepartment } from "@/hooks/use-department";
import type { WorkflowCreateModel } from "@/types/workflows";
import { cn } from "@/lib/utils";

const conditionFields = [
  { label: "Total Amount", value: "total_amount" },
  { label: "Department", value: "department" },
  { label: "Category", value: "category" },
];

const operatorOptions = [
  { label: "Equals", value: "eq" },
  { label: "Greater Than", value: "gt" },
  { label: "Less Than", value: "lt" },
  { label: "Greater or Equal", value: "gte" },
  { label: "Less or Equal", value: "lte" },
  { label: "Between", value: "between" },
];

const actionTypes = [
  { label: "Skip Stage", value: "SKIP_STAGE" },
  { label: "Next Stage", value: "NEXT_STAGE" },
];

interface WfRoutingProps {
  readonly form: UseFormReturn<WorkflowCreateModel>;
  readonly fieldArray: UseFieldArrayReturn<
    WorkflowCreateModel,
    "data.routing_rules"
  >;
  readonly stages: { id: string; name: string }[];
  readonly isDisabled: boolean;
}

export function WfRouting({
  form,
  fieldArray,
  stages,
  isDisabled,
}: WfRoutingProps) {
  const { fields, append, remove } = fieldArray;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: deptData } = useDepartment();
  const departments = deptData?.data ?? [];

  const stageNames = useMemo(() => stages.map((s) => s.name), [stages]);

  const safeIndex =
    selectedIndex >= fields.length
      ? Math.max(0, fields.length - 1)
      : selectedIndex;

  const handleAddRule = () => {
    append({
      name: `New Rule ${fields.length + 1}`,
      description: "",
      trigger_stage: stageNames[0] ?? "",
      condition: { field: "", operator: "eq", value: [] },
      action: {
        type: "NEXT_STAGE",
        parameters: { target_stage: stageNames[stageNames.length - 1] ?? "" },
      },
    });
    setSelectedIndex(fields.length);
  };

  const handleRemoveRule = (idx: number) => {
    remove(idx);
    if (safeIndex >= fields.length - 1) {
      setSelectedIndex(Math.max(0, fields.length - 2));
    }
  };

  const watchedRules = useWatch({
    control: form.control,
    name: "data.routing_rules",
  });
  const currentRule = watchedRules?.[safeIndex];
  const watchedField = currentRule?.condition?.field;
  const watchedOperator = currentRule?.condition?.operator;
  const watchedConditionValue = currentRule?.condition?.value;

  const handleFieldChange = (value: string) => {
    form.setValue(`data.routing_rules.${safeIndex}.condition.field`, value);
    form.setValue(`data.routing_rules.${safeIndex}.condition.operator`, "eq");
    form.setValue(`data.routing_rules.${safeIndex}.condition.value`, []);
    form.setValue(
      `data.routing_rules.${safeIndex}.condition.min_value`,
      undefined,
    );
    form.setValue(
      `data.routing_rules.${safeIndex}.condition.max_value`,
      undefined,
    );
  };

  return (
    <div className="flex gap-3 pt-3">
      {/* Left: Rule list */}
      <div className="w-48 shrink-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium">Rules</span>
          {!isDisabled && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleAddRule}
              className="h-6 text-xs px-1.5"
            >
              <Plus className="size-2.5" />
              Add
            </Button>
          )}
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">
            No routing rules. Add a rule to customize routing.
          </p>
        ) : (
          <div className="space-y-0.5">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className={cn(
                  "flex items-center rounded border text-[11px]",
                  safeIndex === idx && "border-primary bg-primary/5",
                )}
              >
                <button
                  type="button"
                  className="flex-1 truncate px-1.5 py-1 text-left"
                  onClick={() => setSelectedIndex(idx)}
                >
                  {watchedRules?.[idx]?.name || `Rule ${idx + 1}`}
                </button>
                {!isDisabled && (
                  <button
                    type="button"
                    className="px-1 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveRule(idx)}
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Rule detail */}
      <div className="flex-1 rounded border p-3">
        {fields.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-6 text-center">
            Select or add a routing rule to configure.
          </p>
        ) : (
          <div className="space-y-3">
            <FieldGroup className="gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <FieldLabel className="text-[11px]">Rule Name</FieldLabel>
                  <Input
                    className="h-8 text-xs"
                    disabled={isDisabled}
                    {...form.register(`data.routing_rules.${safeIndex}.name`)}
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-[11px]">Trigger Stage</FieldLabel>
                  <Controller
                    control={form.control}
                    name={`data.routing_rules.${safeIndex}.trigger_stage`}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled}
                      >
                        <SelectTrigger size="sm" className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stageNames.map((name) => (
                            <SelectItem
                              key={name}
                              value={name}
                              className="text-xs"
                            >
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel className="text-[11px]">Description</FieldLabel>
                <Textarea
                  className="text-xs min-h-12"
                  disabled={isDisabled}
                  placeholder="Optional"
                  maxLength={256}
                  {...form.register(
                    `data.routing_rules.${safeIndex}.description`,
                  )}
                />
              </Field>
            </FieldGroup>

            {/* Condition section */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium">Condition</span>

              <FieldGroup className="gap-2">
                <div
                  className={cn(
                    "grid gap-2",
                    watchedField === "total_amount"
                      ? "grid-cols-2"
                      : "grid-cols-1",
                  )}
                >
                  <Field>
                    <FieldLabel className="text-[11px]">Field</FieldLabel>
                    <Select
                      value={watchedField ?? ""}
                      onValueChange={handleFieldChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionFields.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  {watchedField === "total_amount" && (
                    <Field>
                      <FieldLabel className="text-[11px]">Operator</FieldLabel>
                      <Controller
                        control={form.control}
                        name={`data.routing_rules.${safeIndex}.condition.operator`}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isDisabled}
                          >
                            <SelectTrigger size="sm" className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operatorOptions.map((opt) => (
                                <SelectItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-xs"
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                  )}
                </div>

                {watchedField === "total_amount" &&
                  watchedOperator !== "between" && (
                    <Field>
                      <FieldLabel className="text-[11px]">Value</FieldLabel>
                      <Input
                        type="number"
                        className="h-7 text-xs"
                        disabled={isDisabled}
                        value={watchedConditionValue?.[0] ?? ""}
                        onChange={(e) =>
                          form.setValue(
                            `data.routing_rules.${safeIndex}.condition.value`,
                            e.target.value ? [e.target.value] : [],
                          )
                        }
                      />
                    </Field>
                  )}

                {watchedField === "total_amount" &&
                  watchedOperator === "between" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Field>
                        <FieldLabel className="text-[11px]">
                          Min Value
                        </FieldLabel>
                        <Input
                          type="number"
                          className="h-7 text-xs"
                          disabled={isDisabled}
                          {...form.register(
                            `data.routing_rules.${safeIndex}.condition.min_value`,
                          )}
                        />
                      </Field>
                      <Field>
                        <FieldLabel className="text-[11px]">
                          Max Value
                        </FieldLabel>
                        <Input
                          type="number"
                          className="h-7 text-xs"
                          disabled={isDisabled}
                          {...form.register(
                            `data.routing_rules.${safeIndex}.condition.max_value`,
                          )}
                        />
                      </Field>
                    </div>
                  )}

                {watchedField === "department" && (
                  <DepartmentCheckboxList
                    departments={departments}
                    value={watchedConditionValue ?? []}
                    onChange={(val) =>
                      form.setValue(
                        `data.routing_rules.${safeIndex}.condition.value`,
                        val,
                      )
                    }
                    isDisabled={isDisabled}
                  />
                )}

                {watchedField === "category" && (
                  <CategoryCheckboxList
                    form={form}
                    ruleIndex={safeIndex}
                    isDisabled={isDisabled}
                  />
                )}
              </FieldGroup>
            </div>

            {/* Action section */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium">Action</span>

              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <FieldLabel className="text-[11px]">Type</FieldLabel>
                  <Controller
                    control={form.control}
                    name={`data.routing_rules.${safeIndex}.action.type`}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTypes.map((opt) => (
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
                  <FieldLabel className="text-[11px]">Target Stage</FieldLabel>
                  <Controller
                    control={form.control}
                    name={`data.routing_rules.${safeIndex}.action.parameters.target_stage`}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stageNames.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Department checkbox list ---

interface DepartmentCheckboxListProps {
  readonly departments: { id: string; name: string }[];
  readonly value: string[];
  readonly onChange: (value: string[]) => void;
  readonly isDisabled: boolean;
}

const DepartmentCheckboxList = ({
  departments,
  value,
  onChange,
  isDisabled,
}: DepartmentCheckboxListProps) => {
  const valueSet = new Set(value);

  const toggle = (deptName: string) => {
    if (valueSet.has(deptName)) {
      onChange(value.filter((v) => v !== deptName));
    } else {
      onChange([...value, deptName]);
    }
  };

  return (
    <Field>
      <FieldLabel className="text-[11px]">Departments</FieldLabel>
      <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-1.5">
        {departments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No departments available
          </p>
        ) : (
          departments.map((dept) => (
            <div key={dept.id} className="flex items-center gap-1.5">
              <Checkbox
                checked={valueSet.has(dept.name)}
                onCheckedChange={() => toggle(dept.name)}
                disabled={isDisabled}
              />
              <span className="text-[11px]">{dept.name}</span>
            </div>
          ))
        )}
      </div>
    </Field>
  );
};

// --- Category checkbox list (extracted from products in form) ---

interface CategoryCheckboxListProps {
  readonly form: UseFormReturn<WorkflowCreateModel>;
  readonly ruleIndex: number;
  readonly isDisabled: boolean;
}

const CategoryCheckboxList = ({
  form,
  ruleIndex,
  isDisabled,
}: CategoryCheckboxListProps) => {
  const products = useWatch({ control: form.control, name: "data.products" });

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products ?? []) {
      if (p.product_category?.id && p.product_category?.name) {
        map.set(p.product_category.id, p.product_category.name);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const value =
    useWatch({
      control: form.control,
      name: `data.routing_rules.${ruleIndex}.condition.value`,
    }) ?? [];
  const valueSet = new Set(value);

  const toggle = (catName: string) => {
    if (valueSet.has(catName)) {
      form.setValue(
        `data.routing_rules.${ruleIndex}.condition.value`,
        value.filter((v) => v !== catName),
      );
    } else {
      form.setValue(`data.routing_rules.${ruleIndex}.condition.value`, [
        ...value,
        catName,
      ]);
    }
  };

  return (
    <Field>
      <FieldLabel className="text-[11px]">Categories</FieldLabel>
      <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-1.5">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories available. Add products first.
          </p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5">
              <Checkbox
                checked={valueSet.has(cat.name)}
                onCheckedChange={() => toggle(cat.name)}
                disabled={isDisabled}
              />
              <span className="text-[11px]">{cat.name}</span>
            </div>
          ))
        )}
      </div>
    </Field>
  );
};
