import { Router } from "express";
import {
  getDepartments,
  getRooms,
  createRoomHandler,
  deleteRoomHandler,
  getSubjects,
  createSubjectHandler,
  deleteSubjectHandler,
  getFacultyHandler,
  createFacultyHandler,
  deleteFacultyHandler,
  getStudentsHandler,
  createStudentHandler,
  deleteStudentHandler,
  evaluateEligibilityHandler,
  importStudentsHandler,
} from "../controllers/academic.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { UserRole } from "@nexora/contracts";

export const academicRouter = Router();

// ==========================================
// DEPARTMENTS
// ==========================================
academicRouter.get("/departments", getDepartments);

// ==========================================
// EXAMINATION ROOMS & BLOCKS
// ==========================================
academicRouter.get("/rooms", getRooms);
academicRouter.post(
  "/rooms",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  createRoomHandler
);
academicRouter.delete(
  "/rooms/:id",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  deleteRoomHandler
);

// ==========================================
// SUBJECTS & COURSES
// ==========================================
academicRouter.get("/subjects", getSubjects);
academicRouter.post(
  "/subjects",
  authenticateToken,
  requireRole(UserRole.DEPARTMENTAL_COORDINATOR, UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  createSubjectHandler
);
academicRouter.delete(
  "/subjects/:id",
  authenticateToken,
  requireRole(UserRole.DEPARTMENTAL_COORDINATOR, UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  deleteSubjectHandler
);

// ==========================================
// FACULTY / TEACHERS
// ==========================================
academicRouter.get("/faculty", getFacultyHandler);
academicRouter.post(
  "/faculty",
  authenticateToken,
  requireRole(UserRole.DEPARTMENTAL_COORDINATOR, UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  createFacultyHandler
);
academicRouter.delete(
  "/faculty/:id",
  authenticateToken,
  requireRole(UserRole.DEPARTMENTAL_COORDINATOR, UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  deleteFacultyHandler
);

// ==========================================
// STUDENTS
// ==========================================
academicRouter.get("/students", getStudentsHandler);
academicRouter.post(
  "/students",
  authenticateToken,
  requireRole(UserRole.DEPARTMENTAL_COORDINATOR, UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  createStudentHandler
);
academicRouter.delete(
  "/students/:id",
  authenticateToken,
  requireRole(UserRole.DEPARTMENTAL_COORDINATOR, UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  deleteStudentHandler
);

// ==========================================
// ELIGIBILITY & IMPORT
// ==========================================
academicRouter.post("/evaluate-eligibility", evaluateEligibilityHandler);
academicRouter.post(
  "/import/students",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR, UserRole.ADMIN),
  importStudentsHandler
);
