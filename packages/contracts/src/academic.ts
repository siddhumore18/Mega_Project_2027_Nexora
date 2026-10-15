import { z } from "zod";

export const CreateFacultySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  employeeCode: z.string().min(2, "Employee code required"),
  departmentCode: z.string().min(2, "Department code required"),
  designation: z.string().default("Assistant Professor"),
  maxDutiesPerWeek: z.number().int().min(1).max(10).default(3),
});

export type CreateFacultyInput = z.infer<typeof CreateFacultySchema>;

export const CreateStudentSchema = z.object({
  name: z.string().min(2, "Student name required"),
  email: z.string().email("Invalid email address"),
  rollNumber: z.string().min(2, "Roll number required"),
  departmentCode: z.string().min(2, "Department code required"),
  currentSemester: z.number().int().min(1).max(12).default(1),
  attendancePercentage: z.number().min(0).max(100).default(85.0),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

export const CreateRoomSchema = z.object({
  code: z.string().min(2, "Room/Hall code required (e.g. HALL-A101)"),
  building: z.string().min(2, "Building block name required"),
  floor: z.number().int().min(0).max(20).default(1),
  capacity: z.number().int().min(5).max(1000, "Capacity must be positive"),
  isAccessible: z.boolean().default(true),
  hasProjector: z.boolean().default(false),
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

export const CreateSubjectSchema = z.object({
  code: z.string().min(2, "Subject code required (e.g. CS701)"),
  title: z.string().min(2, "Subject title required"),
  credits: z.number().int().min(1).max(10).default(3),
  departmentCode: z.string().min(2, "Department code required"),
});

export type CreateSubjectInput = z.infer<typeof CreateSubjectSchema>;
