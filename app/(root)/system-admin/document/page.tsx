import type { Metadata } from "next";
import DocumentComponent from "./_components/document-component";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentPage() {
  return <DocumentComponent />;
}
