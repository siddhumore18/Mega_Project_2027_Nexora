import { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { evaluateStudentEligibility, DEFAULT_ELIGIBILITY_POLICY } from "../services/eligibility.service.js";
import { validateStudentBatch } from "../services/import.service.js";
import { MasterDataService } from "../services/master-data.service.js";

const STATIC_DEPARTMENTS = [
  { id: "dept-cse-1", code: "CSE", name: "Computer Science & Engineering" },
  { id: "dept-ece-2", code: "ECE", name: "Electronics & Communication Engineering" },
  { id: "dept-mech-3", code: "MECH", name: "Mechanical Engineering" },
];

export async function getDepartments(_req: Request, res: Response) {
  try {
    const departments = await prisma.department.findMany({
      include: { programs: true },
    });
    if (departments.length > 0) {
      res.json({ success: true, data: departments });
      return;
    }
  } catch {}

  res.json({ success: true, data: STATIC_DEPARTMENTS });
}

export async function getRooms(_req: Request, res: Response) {
  try {
    const rooms = await MasterDataService.listRooms();
    res.json({ success: true, data: rooms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function createRoomHandler(req: Request, res: Response) {
  try {
    const room = await MasterDataService.createRoom(
      req.body,
      req.user?.userId,
      (req as any).correlationId
    );
    res.status(201).json({ success: true, data: room });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || "CREATE_ROOM_ERROR", message: err.message },
    });
  }
}

export async function deleteRoomHandler(req: Request, res: Response) {
  try {
    await MasterDataService.deleteRoom(req.params.id, req.user?.userId);
    res.json({ success: true, data: { deleted: true } });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || "DELETE_ROOM_ERROR", message: err.message },
    });
  }
}

export async function getSubjects(_req: Request, res: Response) {
  try {
    const subjects = await MasterDataService.listSubjects();
    res.json({ success: true, data: subjects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function createSubjectHandler(req: Request, res: Response) {
  try {
    const subject = await MasterDataService.createSubject(
      req.body,
      req.user?.userId,
      (req as any).correlationId
    );
    res.status(201).json({ success: true, data: subject });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || "CREATE_SUBJECT_ERROR", message: err.message },
    });
  }
}

export async function deleteSubjectHandler(req: Request, res: Response) {
  try {
    await MasterDataService.deleteSubject(req.params.id, req.user?.userId);
    res.json({ success: true, data: { deleted: true } });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || "DELETE_SUBJECT_ERROR", message: err.message },
    });
  }
}

// ==========================================
// FACULTY (TEACHERS) CONTROLLERS
// ==========================================

export async function getFacultyHandler(_req: Request, res: Response) {
  try {
    const faculty = await MasterDataService.listFaculty();
    res.json({ success: true, data: faculty });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function createFacultyHandler(req: Request, res: Response) {
  try {
    const faculty = await MasterDataService.createFaculty(
      req.body,
      req.user?.userId,
      (req as any).correlationId
    );
    res.status(201).json({ success: true, data: faculty });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || "CREATE_FACULTY_ERROR", message: err.message },
    });
  }
}

export async function deleteFacultyHandler(req: Request, res: Response) {
  try {
    await MasterDataService.deleteFaculty(req.params.id, req.user?.userId);
    res.json({ success: true, data: { deleted: true } });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || "DELETE_FACULTY_ERROR", message: err.message },
    });
  }
}

// ==========================================
// STUDENTS CONTROLLERS
// ==========================================

export async function getStudentsHandler(_req: Request, res: Response) {
  try {
    const students = await MasterDataService.listStudents();
    res.json({ success: true, data: students });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function createStudentHandler(req: Request, res: Response) {
  try {
    const student = await MasterDataService.createStudent(
      req.body,
      req.user?.userId,
      (req as any).correlationId
    );
    res.status(201).json({ success: true, data: student });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || "CREATE_STUDENT_ERROR", message: err.message },
    });
  }
}

export async function deleteStudentHandler(req: Request, res: Response) {
  try {
    await MasterDataService.deleteStudent(req.params.id, req.user?.userId);
    res.json({ success: true, data: { deleted: true } });
  } catch (err: any) {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || "DELETE_STUDENT_ERROR", message: err.message },
    });
  }
}

// ==========================================
// ELIGIBILITY & IMPORT
// ==========================================

export function evaluateEligibilityHandler(req: Request, res: Response) {
  const { student, policy } = req.body;

  if (!student || !student.rollNumber || typeof student.attendancePercentage !== "number") {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_STUDENT_RECORD",
        message: "Student object with rollNumber and attendancePercentage is required.",
        correlationId: (req.headers["x-correlation-id"] as string) || "unknown",
      },
    });
    return;
  }

  const result = evaluateStudentEligibility(student, policy || DEFAULT_ELIGIBILITY_POLICY);
  res.json({ success: true, data: result });
}

export function importStudentsHandler(req: Request, res: Response) {
  const { records } = req.body;

  if (!Array.isArray(records)) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_BATCH_PAYLOAD",
        message: "Expected an array of student records in 'records' field.",
        correlationId: (req.headers["x-correlation-id"] as string) || "unknown",
      },
    });
    return;
  }

  const report = validateStudentBatch(records);
  res.json({ success: true, data: report });
}
