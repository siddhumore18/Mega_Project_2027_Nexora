import { HealthStatus, ApiSuccessResponse } from "@nexora/contracts";

const API_BASE = "";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("nexora_auth_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

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
  const res = await fetch(`${API_BASE}/api/v1/schedules/runs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ examCycleId, snapshot }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Optimization run failed");
  }
  return body.data;
}

export async function fetchScheduleRuns(examCycleId: string): Promise<any[]> {
  const res = await fetch(
    `${API_BASE}/api/v1/schedules/runs?examCycleId=${encodeURIComponent(examCycleId)}`,
    { headers: getAuthHeaders() }
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Failed to fetch schedule runs");
  }
  return body.data;
}

export async function fetchScheduleVersions(examCycleId: string): Promise<any[]> {
  const res = await fetch(
    `${API_BASE}/api/v1/schedules/versions?examCycleId=${encodeURIComponent(examCycleId)}`,
    { headers: getAuthHeaders() }
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Failed to fetch schedule versions");
  }
  return body.data;
}

export async function createScheduleVersion(
  examCycleId: string,
  scheduleRunId: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/schedules/versions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ examCycleId, scheduleRunId }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Failed to create schedule version");
  }
  return body.data;
}

export async function submitVersionReview(versionId: string): Promise<any> {
  const res = await fetch(
    `${API_BASE}/api/v1/schedules/versions/${encodeURIComponent(versionId)}/submit-review`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Failed to submit version for review");
  }
  return body.data;
}

export async function approveScheduleVersion(versionId: string): Promise<any> {
  const res = await fetch(
    `${API_BASE}/api/v1/schedules/versions/${encodeURIComponent(versionId)}/approve`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Failed to approve schedule version");
  }
  return body.data;
}

export async function publishScheduleVersion(versionId: string): Promise<any> {
  const res = await fetch(
    `${API_BASE}/api/v1/schedules/versions/${encodeURIComponent(versionId)}/publish`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Failed to publish schedule version");
  }
  return body.data;
}

export async function compareScheduleVersions(
  versionIdA: string,
  versionIdB: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/schedules/versions/compare`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ versionIdA, versionIdB }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || "Failed to compare schedule versions");
  }
  return body.data;
}
