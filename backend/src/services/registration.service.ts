import { ExamCycleStatus } from "@prisma/client";
import { evaluateStudentEligibility } from "./eligibility.service.js";

export interface RegistrationRecord {
  id: string;
  studentId: string;
  rollNumber: string;
  examOfferingId: string;
  subjectCode: string;
  registeredAt: string;
  status: "REGISTERED" | "CANCELLED";
}

export interface RegistrationGapSummary {
  examCycleId: string;
  totalEligibleStudents: number;
  totalRegisteredStudents: number;
  unregisteredCount: number;
  gapPercentage: number;
  unregisteredStudents: {
    studentId: string;
    rollNumber: string;
    name: string;
    subjectCode: string;
  }[];
}

// In-memory store for fast stateful mock testing across restarts & demo modes
const inMemoryRegistrations: RegistrationRecord[] = [];

export function clearInMemoryRegistrations() {
  inMemoryRegistrations.length = 0;
}

export function registerStudent(params: {
  studentId: string;
  rollNumber: string;
  examOfferingId: string;
  subjectCode: string;
  attendancePercentage: number;
  backlogAttempt?: number;
  cycleStatus: ExamCycleStatus;
}): RegistrationRecord {
  // 1. Cycle state check
  if (params.cycleStatus !== ExamCycleStatus.REGISTRATION_OPEN) {
    const error: any = new Error(
      `Cannot register: Examination cycle is currently in '${params.cycleStatus}' state. Registration is closed.`
    );
    error.code = "REGISTRATION_CLOSED";
    error.status = 409;
    throw error;
  }

  // 2. Duplicate registration check (Invariant: Unique [studentId, examOfferingId])
  const alreadyRegistered = inMemoryRegistrations.some(
    (r) =>
      r.studentId === params.studentId &&
      r.examOfferingId === params.examOfferingId &&
      r.status === "REGISTERED"
  );

  if (alreadyRegistered) {
    const error: any = new Error(
      `Student ${params.rollNumber} is already registered for exam offering '${params.examOfferingId}'.`
    );
    error.code = "DUPLICATE_REGISTRATION";
    error.status = 409;
    throw error;
  }

  // 3. Eligibility policy evaluation
  const eligibility = evaluateStudentEligibility({
    studentId: params.studentId,
    rollNumber: params.rollNumber,
    subjectCode: params.subjectCode,
    attendancePercentage: params.attendancePercentage,
    backlogAttempt: params.backlogAttempt || 0,
  });

  if (!eligibility.isEligible) {
    const error: any = new Error(
      `Student ${params.rollNumber} is not eligible to register: ${eligibility.reasons.join(" ")}`
    );
    error.code = "STUDENT_INELIGIBLE";
    error.status = 403;
    error.details = eligibility.reasonCodes;
    throw error;
  }

  const record: RegistrationRecord = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId: params.studentId,
    rollNumber: params.rollNumber,
    examOfferingId: params.examOfferingId,
    subjectCode: params.subjectCode,
    registeredAt: new Date().toISOString(),
    status: "REGISTERED",
  };

  inMemoryRegistrations.push(record);
  return record;
}

export function getStudentRegistrations(studentId: string): RegistrationRecord[] {
  return inMemoryRegistrations.filter((r) => r.studentId === studentId);
}

export function computeRegistrationGaps(
  examCycleId: string,
  eligibleCohort: { studentId: string; rollNumber: string; name: string; subjectCode: string; examOfferingId: string }[]
): RegistrationGapSummary {
  const registeredSet = new Set(
    inMemoryRegistrations
      .filter((r) => r.status === "REGISTERED")
      .map((r) => `${r.studentId}_${r.examOfferingId}`)
  );

  const unregisteredStudents = eligibleCohort.filter(
    (c) => !registeredSet.has(`${c.studentId}_${c.examOfferingId}`)
  );

  const totalEligible = eligibleCohort.length;
  const unregisteredCount = unregisteredStudents.length;
  const registeredCount = totalEligible - unregisteredCount;
  const gapPercentage = totalEligible > 0 ? (unregisteredCount / totalEligible) * 100 : 0;

  return {
    examCycleId,
    totalEligibleStudents: totalEligible,
    totalRegisteredStudents: registeredCount,
    unregisteredCount,
    gapPercentage: Math.round(gapPercentage * 10) / 10,
    unregisteredStudents: unregisteredStudents.map((s) => ({
      studentId: s.studentId,
      rollNumber: s.rollNumber,
      name: s.name,
      subjectCode: s.subjectCode,
    })),
  };
}
