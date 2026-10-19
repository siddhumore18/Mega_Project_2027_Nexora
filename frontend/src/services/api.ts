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

// ==========================================
// OPTIMIZATION & SCHEDULE RUNS
// ==========================================

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

// ==========================================
// ACADEMIC MASTER DATA (FACULTY, STUDENTS, ROOMS, SUBJECTS)
// ==========================================

export async function fetchFaculty(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/v1/academic/faculty`, {
    headers: getAuthHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to fetch faculty");
  return body.data;
}

export async function createFaculty(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/academic/faculty`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to create faculty");
  return body.data;
}

export async function deleteFaculty(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/academic/faculty/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to delete faculty");
}

export async function fetchStudents(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/v1/academic/students`, {
    headers: getAuthHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to fetch students");
  return body.data;
}

export async function createStudent(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/academic/students`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to create student");
  return body.data;
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/academic/students/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to delete student");
}

export async function fetchRooms(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/v1/academic/rooms`, {
    headers: getAuthHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to fetch rooms");
  return body.data;
}

export async function createRoom(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/academic/rooms`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to create room");
  return body.data;
}

export async function deleteRoom(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/academic/rooms/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to delete room");
}

export async function fetchSubjects(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/v1/academic/subjects`, {
    headers: getAuthHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to fetch subjects");
  return body.data;
}

export async function createSubject(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/academic/subjects`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to create subject");
  return body.data;
}

export async function deleteSubject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/academic/subjects/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Failed to delete subject");
}
