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

export async function triggerOptimizationRun(
  examCycleId: string,
  snapshot?: any
): Promise<any> {
  const token = localStorage.getItem("nexora_auth_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/schedules/runs`, {
    method: "POST",
    headers,
    body: JSON.stringify({ examCycleId, snapshot }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Optimization run failed");
  }
  return body.data;
}

export async function fetchScheduleRuns(examCycleId: string): Promise<any[]> {
  const token = localStorage.getItem("nexora_auth_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(
    `${API_BASE}/api/v1/schedules/runs?examCycleId=${encodeURIComponent(examCycleId)}`,
    { headers }
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Failed to fetch schedule runs");
  }
  return body.data;
}
