import type { Metadata } from "next";
import WorkflowComponent from "./_components/wf-component";

export const metadata: Metadata = { title: "Workflows" };

export default function WorkflowPage() {
  return <WorkflowComponent />;
}
