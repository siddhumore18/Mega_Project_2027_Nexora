import { z } from "zod";

export const UserRole = {
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  HOD: "HOD",
  DEPARTMENTAL_COORDINATOR: "DEPARTMENTAL_COORDINATOR",
  EXAM_COORDINATOR: "EXAM_COORDINATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleSchema = z.nativeEnum(UserRole);

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId?: string;
}
