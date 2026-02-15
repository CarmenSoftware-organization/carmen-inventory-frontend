import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profile";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { httpClient } from "@/lib/http-client";
import { buildUrl } from "@/utils/build-query-string";
import { API_ENDPOINTS } from "@/constant/api-endpoints";
import { QUERY_KEYS } from "@/constant/query-keys";
import {
  type WorkflowDto,
  type Workflow,
  type WorkflowCreateModel,
  WORKFLOW_TYPE,
} from "@/types/workflows";
import type { ParamsDto } from "@/types/params";

interface WorkflowListResponse {
  data: WorkflowDto[];
}

export function useWorkflow(params?: ParamsDto) {
  const { buCode } = useProfile();

  return useQuery<WorkflowListResponse>({
    queryKey: [QUERY_KEYS.WORKFLOWS, buCode, params],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const url = buildUrl(API_ENDPOINTS.WORKFLOWS(buCode), params);
      const res = await httpClient.get(url);
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return res.json();
    },
    enabled: !!buCode,
  });
}

export function useWorkflowTypeQuery(type: WORKFLOW_TYPE) {
  const { buCode } = useProfile();

  return useQuery<WorkflowDto[]>({
    queryKey: [QUERY_KEYS.WORKFLOWS, buCode, "type", type],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `/api/proxy/api/${buCode}/workflow/type/${type}`,
      );
      if (!res.ok) throw new Error("Failed to fetch workflows by type");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!buCode,
  });
}

export function useWorkflowById(id: string | undefined) {
  const { buCode } = useProfile();

  return useQuery<Workflow>({
    queryKey: [QUERY_KEYS.WORKFLOWS, buCode, id],
    queryFn: async () => {
      if (!buCode) throw new Error("Missing buCode");
      const res = await httpClient.get(
        `${API_ENDPOINTS.WORKFLOWS(buCode)}/${id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch workflow");
      const json = await res.json();
      return json.data;
    },
    enabled: !!buCode && !!id,
  });
}

export function useCreateWorkflow() {
  return useApiMutation<WorkflowCreateModel>({
    mutationFn: (data, buCode) =>
      httpClient.post(API_ENDPOINTS.WORKFLOWS(buCode), data),
    invalidateKeys: [QUERY_KEYS.WORKFLOWS],
    errorMessage: "Failed to create workflow",
  });
}

export function useUpdateWorkflow() {
  return useApiMutation<WorkflowCreateModel & { id: string }>({
    mutationFn: ({ id, ...data }, buCode) =>
      httpClient.put(`${API_ENDPOINTS.WORKFLOWS(buCode)}/${id}`, data),
    invalidateKeys: [QUERY_KEYS.WORKFLOWS],
    errorMessage: "Failed to update workflow",
  });
}

export function useDeleteWorkflow() {
  return useApiMutation<string>({
    mutationFn: (id, buCode) =>
      httpClient.delete(`${API_ENDPOINTS.WORKFLOWS(buCode)}/${id}`),
    invalidateKeys: [QUERY_KEYS.WORKFLOWS],
    errorMessage: "Failed to delete workflow",
  });
}
