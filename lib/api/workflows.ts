import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import type {
  WorkflowDto,
  Workflow,
  WorkflowCreateModel,
} from "@/types/workflows";
import type { ParamsDto, PaginatedResponse } from "@/types/params";

export async function getWorkflows(
  buCode: string,
  params?: ParamsDto,
): Promise<PaginatedResponse<WorkflowDto>> {
  const url = buildUrl(API_ENDPOINTS.WORKFLOWS(buCode), params);
  const res = await httpClient.get(url);
  if (!res.ok) throw new Error("Failed to fetch workflows");
  return res.json();
}

export async function getWorkflowsByType(
  buCode: string,
  type: string,
): Promise<WorkflowDto[]> {
  const res = await httpClient.get(
    API_ENDPOINTS.WORKFLOW_BY_TYPE(buCode, type),
  );
  if (!res.ok) throw new Error("Failed to fetch workflows by type");
  const json = await res.json();
  return json.data ?? [];
}

export async function getWorkflowById(
  buCode: string,
  id: string,
): Promise<Workflow> {
  const res = await httpClient.get(
    `${API_ENDPOINTS.WORKFLOWS(buCode)}/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch workflow");
  const json = await res.json();
  return json.data;
}

export async function createWorkflow(
  buCode: string,
  data: WorkflowCreateModel,
): Promise<Response> {
  return httpClient.post(API_ENDPOINTS.WORKFLOWS(buCode), data);
}

export async function updateWorkflow(
  buCode: string,
  id: string,
  data: WorkflowCreateModel,
): Promise<Response> {
  return httpClient.put(`${API_ENDPOINTS.WORKFLOWS(buCode)}/${id}`, data);
}

export async function deleteWorkflow(
  buCode: string,
  id: string,
): Promise<Response> {
  return httpClient.delete(`${API_ENDPOINTS.WORKFLOWS(buCode)}/${id}`);
}
