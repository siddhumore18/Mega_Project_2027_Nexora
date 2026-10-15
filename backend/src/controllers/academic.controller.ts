import { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { evaluateStudentEligibility, DEFAULT_ELIGIBILITY_POLICY } from "../services/eligibility.service.js";
import { validateStudentBatch } from "../services/import.service.js";

// Static fallback data for departments/rooms/subjects when database is in seed/offline state
const STATIC_DEPARTMENTS = [
  { id: "dept-cse-1", code: "CSE", name: "Computer Science & Engineering" },
  { id: "dept-ece-2", code: "ECE", name: "Electronics & Communication Engineering" },
  { id: "dept-mech-3", code: "MECH", name: "Mechanical Engineering" },
];

const STATIC_ROOMS = [
  { id: "room-1", code: "HALL-A101", building: "Main Block", floor: 1, capacity: 150, isAccessible: true },
  { id: "room-2", code: "HALL-B204", building: "Science Block", floor: 2, capacity: 100, isAccessible: true },
  { id: "room-3", code: "HALL-C301", building: "Tech Complex", floor: 3, capacity: 90, isAccessible: false },
];

const STATIC_SUBJECTS = [
  { id: "sub-1", code: "CS701", title: "Distributed Systems & Cloud Computing", credits: 4, departmentCode: "CSE" },
  { id: "sub-2", code: "EC702", title: "VLSI Architecture & Embedded Logic", credits: 4, departmentCode: "ECE" },
  { id: "sub-3", code: "ME703", title: "Finite Element Methods & Dynamics", credits: 4, departmentCode: "MECH" },
  { id: "sub-4", code: "CS704", title: "Cryptography & Network Security", credits: 3, departmentCode: "CSE" },
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
    const rooms = await prisma.room.findMany();
    if (rooms.length > 0) {
      res.json({ success: true, data: rooms });
      return;
    }
  } catch {}

  res.json({ success: true, data: STATIC_ROOMS });
}

export async function getSubjects(_req: Request, res: Response) {
  try {
    const subjects = await prisma.subject.findMany({
      include: { department: true },
    });
    if (subjects.length > 0) {
      res.json({ success: true, data: subjects });
      return;
    }
  } catch {}

  res.json({ success: true, data: STATIC_SUBJECTS });
}

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
