import type { Metadata } from "next";
import WorkflowNewForm from "../_components/wf-new-form";

export const metadata: Metadata = { title: "New Workflow" };

export default function NewWorkflowPage() {
  return <WorkflowNewForm />;
}
