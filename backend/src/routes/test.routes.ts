import { Router } from "express";
import { UserRole } from "@nexora/contracts";
import { authenticateToken, requireRole, requireDepartmentScope } from "../middleware/auth.middleware.js";

export const testRouter = Router();

testRouter.get(
  "/coordinator-only",
  authenticateToken,
  requireRole(UserRole.EXAM_COORDINATOR),
  (_req, res) => {
    res.json({ success: true, message: "Welcome Coordinator" });
  }
);

testRouter.get(
  "/departments/:departmentId/records",
  authenticateToken,
  requireRole(UserRole.HOD, UserRole.ADMIN, UserRole.EXAM_COORDINATOR),
  requireDepartmentScope("departmentId"),
  (req, res) => {
    res.json({ success: true, departmentId: req.params.departmentId });
  }
);
