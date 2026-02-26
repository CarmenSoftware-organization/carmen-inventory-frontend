import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VendorFormValues } from "./vendor-form";

interface VendorInfoTabProps {
  form: ReturnType<typeof useForm<VendorFormValues>>;
  isDisabled: boolean;
  infoFields: ReturnType<
    typeof useFieldArray<VendorFormValues, "info">
  >["fields"];
  appendInfo: ReturnType<
    typeof useFieldArray<VendorFormValues, "info">
  >["append"];
  removeInfo: ReturnType<
    typeof useFieldArray<VendorFormValues, "info">
  >["remove"];
}

export function VendorInfoTab({
  form,
  isDisabled,
  infoFields,
  appendInfo,
  removeInfo,
}: VendorInfoTabProps) {
  return (
    <div className="max-w-2xl space-y-3 pt-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Additional Info</span>
        {!isDisabled && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() =>
              appendInfo({
                label: "",
                value: "",
                data_type: "string",
              })
            }
          >
            <Plus />
            Add
          </Button>
        )}
      </div>
      {infoFields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No additional info</p>
      ) : (
        <div className="space-y-2">
          {infoFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <Input
                placeholder="Label"
                className="h-8 flex-1 text-sm"
                disabled={isDisabled}
                {...form.register(`info.${index}.label`)}
              />
              <Input
                placeholder="Value"
                className="h-8 flex-1 text-sm"
                disabled={isDisabled}
                {...form.register(`info.${index}.value`)}
              />
              <Controller
                control={form.control}
                name={`info.${index}.data_type`}
                render={({ field: dtField }) => (
                  <Select
                    value={dtField.value}
                    onValueChange={dtField.onChange}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="h-8 w-28 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {!isDisabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove info"
                  onClick={() => removeInfo(index)}
                >
                  <X />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
