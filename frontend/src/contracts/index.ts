/**
 * @nexora/contracts vendored for standalone frontend deployment
 */
export const UserRole = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  HOD: "HOD",
  DEPARTMENTAL_COORDINATOR: "DEPARTMENTAL_COORDINATOR",
  EXAM_COORDINATOR: "EXAM_COORDINATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId?: string;
}

export interface HealthStatus {
  status: "ok";
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  environment: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    correlationId: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
