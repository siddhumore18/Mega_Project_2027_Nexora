import { HealthStatus, ApiSuccessResponse } from "@nexora/contracts";

const API_BASE = "";

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with status: ${res.status}`);
  }
  const body = (await res.json()) as ApiSuccessResponse<HealthStatus>;
  return body.data;
}
