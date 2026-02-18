"use client";

import { useState } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateWorkflow } from "@/hooks/use-workflow";
import {
  wfFormSchema,
  type Workflow,
  type WorkflowCreateModel,
  type User,
  type Product,
} from "@/types/workflows";
import { WfHeader } from "./wf-header";
import { WfGeneral } from "./wf-general";
import { WfStages } from "./wf-stages";
import { WfRouting } from "./wf-routing";
import { WfProducts } from "./wf-products";

interface WfDetailProps {
  readonly workflow: Workflow;
  readonly users: User[];
  readonly products: Product[];
}

export function WfDetail({ workflow, users, products }: WfDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateWorkflow = useUpdateWorkflow();
  const isPending = updateWorkflow.isPending;
  const isDisabled = !isEditing || isPending;

  const form = useForm<WorkflowCreateModel>({
    resolver: zodResolver(wfFormSchema) as Resolver<WorkflowCreateModel>,
    defaultValues: {
      id: workflow.id,
      name: workflow.name,
      workflow_type: workflow.workflow_type,
      is_active: workflow.is_active,
      description: workflow.description ?? "",
      data: (workflow.data as unknown as WorkflowCreateModel["data"]) ?? {
        document_reference_pattern: "PR-{YYYY}-{MM}-{####}",
        stages: [],
        routing_rules: [],
        notifications: [],
        notification_templates: [],
        products: [],
      },
    },
  });

  const stagesFieldArray = useFieldArray({
    control: form.control,
    name: "data.stages",
  });

  const routingFieldArray = useFieldArray({
    control: form.control,
    name: "data.routing_rules",
  });

  const onSubmit = (values: WorkflowCreateModel) => {
    updateWorkflow.mutate(
      { id: workflow.id, ...values },
      {
        onSuccess: () => {
          toast.success("Workflow updated successfully");
          form.reset(values);
          setIsEditing(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <WfHeader
        workflow={workflow}
        isEditing={isEditing}
        isPending={isPending}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        formId="wf-detail-form"
      />

      <form id="wf-detail-form" onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-[11px]">
              General
            </TabsTrigger>
            <TabsTrigger value="stages" className="text-[11px]">
              Stages
            </TabsTrigger>
            <TabsTrigger value="routing" className="text-[11px]">
              Routing
            </TabsTrigger>
            <TabsTrigger value="products" className="text-[11px]">
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <WfGeneral form={form} isDisabled={isDisabled} />
          </TabsContent>

          <TabsContent value="stages">
            <WfStages
              form={form}
              fieldArray={stagesFieldArray}
              users={users}
              isDisabled={isDisabled}
            />
          </TabsContent>

          <TabsContent value="routing">
            <WfRouting
              form={form}
              fieldArray={routingFieldArray}
              stages={stagesFieldArray.fields}
              isDisabled={isDisabled}
            />
          </TabsContent>

          <TabsContent value="products">
            <WfProducts
              form={form}
              allProducts={products}
              isDisabled={isDisabled}
            />
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
