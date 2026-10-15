import { ExamCycleStatus } from "@prisma/client";

export const ALLOWED_STATUS_TRANSITIONS: Record<ExamCycleStatus, ExamCycleStatus[]> = {
  [ExamCycleStatus.DRAFT]: [ExamCycleStatus.REGISTRATION_OPEN, ExamCycleStatus.ARCHIVED],
  [ExamCycleStatus.REGISTRATION_OPEN]: [ExamCycleStatus.SCHEDULING, ExamCycleStatus.DRAFT],
  [ExamCycleStatus.SCHEDULING]: [ExamCycleStatus.PUBLISHED, ExamCycleStatus.REGISTRATION_OPEN],
  [ExamCycleStatus.PUBLISHED]: [ExamCycleStatus.ARCHIVED],
  [ExamCycleStatus.ARCHIVED]: [], // Terminal state
};

export function canTransitionStatus(
  currentStatus: ExamCycleStatus,
  targetStatus: ExamCycleStatus
): boolean {
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

export interface ExamCycleData {
  id: string;
  name: string;
  academicTermId: string;
  registrationStart: string;
  registrationEnd: string;
  status: ExamCycleStatus;
}

export interface ExamOfferingData {
  id: string;
  examCycleId: string;
  subjectOfferingId: string;
  subjectCode: string;
  subjectTitle: string;
  durationMinutes: number;
  isBacklogOffering: boolean;
}
