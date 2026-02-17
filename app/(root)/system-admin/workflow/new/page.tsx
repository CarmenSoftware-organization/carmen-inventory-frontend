"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { toast } from "sonner";
import { useCreateWorkflow } from "@/hooks/use-workflow";
import {
  WORKFLOW_TYPE,
  workflowTypeField,
  type WorkflowCreateModel,
  type Stage,
} from "@/types/workflows";

const createSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(50),
  workflow_type: z.string().min(1, "Workflow type is required"),
  is_active: z.boolean(),
  description: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

function buildDefaultStages(): Stage[] {
  return [
    {
      name: "Create Request",
      description: "",
      sla: "24",
      sla_unit: "hours",
      role: "create",
      creator_access: "only_creator",
      available_actions: {
        submit: {
          is_active: true,
          recipients: {
            requestor: true,
            current_approve: false,
            next_step: true,
          },
        },
        approve: {
          is_active: false,
          recipients: {
            requestor: false,
            current_approve: false,
            next_step: false,
          },
        },
        reject: {
          is_active: false,
          recipients: {
            requestor: false,
            current_approve: false,
            next_step: false,
          },
        },
        sendback: {
          is_active: false,
          recipients: {
            requestor: false,
            current_approve: false,
            next_step: false,
          },
        },
      },
      hide_fields: { price_per_unit: false, total_price: false },
      assigned_users: [],
    },
    {
      name: "Completed",
      description: "",
      sla: "0",
      sla_unit: "hours",
      role: "approve",
      available_actions: {
        submit: {
          is_active: false,
          recipients: {
            requestor: false,
            current_approve: false,
            next_step: false,
          },
        },
        approve: {
          is_active: false,
          recipients: {
            requestor: false,
            current_approve: false,
            next_step: false,
          },
        },
        reject: {
          is_active: false,
          recipients: {
            requestor: false,
            current_approve: false,
            next_step: false,
          },
        },
        sendback: {
          is_active: false,
          recipients: {
            requestor: false,
            current_approve: false,
            next_step: false,
          },
        },
      },
      hide_fields: { price_per_unit: false, total_price: false },
      assigned_users: [],
    },
  ];
}

export default function NewWorkflowPage() {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const isPending = createWorkflow.isPending;

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema) as Resolver<CreateFormValues>,
    defaultValues: {
      name: "",
      workflow_type: WORKFLOW_TYPE.PR,
      is_active: true,
      description: "",
    },
  });

  const onSubmit = (values: CreateFormValues) => {
    const payload: WorkflowCreateModel = {
      id: crypto.randomUUID(),
      name: values.name,
      workflow_type: values.workflow_type,
      is_active: values.is_active,
      description: values.description ?? "",
      data: {
        document_reference_pattern: "PR-{YYYY}-{MM}-{####}",
        stages: buildDefaultStages(),
        routing_rules: [],
        notifications: [],
        notification_templates: [],
        products: [],
      },
    };

    createWorkflow.mutate(payload, {
      onSuccess: (res) => {
        toast.success("Workflow created successfully");
        const data = res as unknown as { data?: { id?: string } };
        const id = data?.data?.id ?? payload.id;
        router.replace(`/system-admin/workflow/${id}`);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/system-admin/workflow")}
          >
            <ArrowLeft className="size-3.5" />
          </Button>
          <h1 className="text-sm font-semibold">New Workflow</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/system-admin/workflow")}
            disabled={isPending}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            form="new-workflow-form"
            disabled={isPending}
            className="h-7 text-xs"
          >
            {isPending ? "Creating..." : "Create Workflow"}
          </Button>
        </div>
      </div>

      <form
        id="new-workflow-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl"
      >
        <FieldGroup className="gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="wf-name" className="text-[11px]">
                Workflow Name
              </FieldLabel>
              <Input
                id="wf-name"
                placeholder="e.g. Purchase Request Approval"
                className="h-7 text-xs"
                disabled={isPending}
                {...form.register("name")}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.workflow_type}>
              <FieldLabel htmlFor="wf-type" className="text-[11px]">
                Workflow Type
              </FieldLabel>
              <Controller
                control={form.control}
                name="workflow_type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="wf-type" className="h-7 text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowTypeField.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>
                {form.formState.errors.workflow_type?.message}
              </FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="wf-description" className="text-[11px]">
              Description
            </FieldLabel>
            <Textarea
              id="wf-description"
              placeholder="Optional description"
              className="text-xs min-h-[60px]"
              disabled={isPending}
              {...form.register("description")}
            />
          </Field>

          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="wf-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />
            <FieldLabel htmlFor="wf-is-active" className="text-[11px]">
              Active
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>

      <div className="max-w-2xl rounded border border-blue-200 bg-blue-50 px-2.5 py-2 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-start gap-1.5">
          <Info className="mt-0.5 size-3.5 text-blue-600 dark:text-blue-400" />
          <div className="space-y-0.5 text-[11px]">
            <p className="font-medium text-blue-800 dark:text-blue-300">
              Default Configuration
            </p>
            <p className="text-blue-700 dark:text-blue-400">
              2 default stages: <strong>Create Request</strong> (SLA: 24h)
              and <strong>Completed</strong>. Configure more after creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
