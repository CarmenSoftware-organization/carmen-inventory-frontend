import { useQuery } from "@tanstack/react-query";
import { useBuCode } from "@/hooks/use-bu-code";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { QUERY_KEYS } from "@/constant/query-keys";
import {
  type WorkflowDto,
  type Workflow,
  type WorkflowCreateModel,
  WORKFLOW_TYPE,
} from "@/types/workflows";
import type { PaginatedResponse, ParamsDto } from "@/types/params";
import { CACHE_STATIC } from "@/lib/cache-config";
import * as api from "@/lib/api/workflows";

export function useWorkflow(params?: ParamsDto) {
  const buCode = useBuCode();

  return useQuery<PaginatedResponse<WorkflowDto>>({
    queryKey: [QUERY_KEYS.WORKFLOWS, buCode, params],
    queryFn: () => api.getWorkflows(buCode!, params),
    enabled: !!buCode,
    ...CACHE_STATIC,
  });
}

export function useWorkflowTypeQuery(type: WORKFLOW_TYPE) {
  const buCode = useBuCode();

  return useQuery<WorkflowDto[]>({
    queryKey: [QUERY_KEYS.WORKFLOWS, buCode, "type", type],
    queryFn: () => api.getWorkflowsByType(buCode!, type),
    enabled: !!buCode,
    ...CACHE_STATIC,
  });
}

export function useWorkflowById(id: string | undefined) {
  const buCode = useBuCode();

  return useQuery<Workflow>({
    queryKey: [QUERY_KEYS.WORKFLOWS, buCode, id],
    queryFn: () => api.getWorkflowById(buCode!, id!),
    enabled: !!buCode && !!id,
  });
}

export function useCreateWorkflow() {
  return useApiMutation<WorkflowCreateModel>({
    mutationFn: (data, buCode) => api.createWorkflow(buCode, data),
    invalidateKeys: [QUERY_KEYS.WORKFLOWS],
    errorMessage: "Failed to create workflow",
  });
}

export function useUpdateWorkflow() {
  return useApiMutation<WorkflowCreateModel & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      api.updateWorkflow(buCode, id, data),
    invalidateKeys: [QUERY_KEYS.WORKFLOWS],
    errorMessage: "Failed to update workflow",
  });
}

export function useDeleteWorkflow() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) => api.deleteWorkflow(buCode, id),
    invalidateKeys: [QUERY_KEYS.WORKFLOWS],
    errorMessage: "Failed to delete workflow",
  });
}
