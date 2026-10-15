export interface EligibilityPolicyConfig {
  ruleVersion: string;
  minAttendancePercentage: number;
  allowMedicalConcession: boolean;
  minMedicalAttendancePercentage: number;
  maxBacklogAttempts: number;
  requireFeeClearance: boolean;
}

export const DEFAULT_ELIGIBILITY_POLICY: EligibilityPolicyConfig = {
  ruleVersion: "2026.1-STANDARD",
  minAttendancePercentage: 75.0,
  allowMedicalConcession: true,
  minMedicalAttendancePercentage: 65.0,
  maxBacklogAttempts: 3,
  requireFeeClearance: true,
};

export interface StudentAcademicInput {
  studentId: string;
  rollNumber: string;
  subjectCode: string;
  attendancePercentage: number;
  hasMedicalApproved?: boolean;
  backlogAttempt: number;
  feeClearanceStatus?: "CLEARED" | "PENDING" | "BLOCKED";
}

export interface EligibilityResult {
  studentId: string;
  rollNumber: string;
  subjectCode: string;
  isEligible: boolean;
  reasonCodes: string[];
  reasons: string[];
  ruleVersion: string;
  evaluatedAt: string;
}

export function evaluateStudentEligibility(
  record: StudentAcademicInput,
  policy: EligibilityPolicyConfig = DEFAULT_ELIGIBILITY_POLICY
): EligibilityResult {
  const reasonCodes: string[] = [];
  const reasons: string[] = [];

  // 1. Attendance Check
  if (record.attendancePercentage < policy.minAttendancePercentage) {
    if (
      policy.allowMedicalConcession &&
      record.hasMedicalApproved &&
      record.attendancePercentage >= policy.minMedicalAttendancePercentage
    ) {
      reasons.push(
        `Attendance (${record.attendancePercentage}%) is below 75% standard, but cleared under approved Medical Exemption (${policy.minMedicalAttendancePercentage}% threshold).`
      );
    } else {
      reasonCodes.push("ATTENDANCE_SHORTAGE");
      reasons.push(
        `Attendance shortage: ${record.attendancePercentage.toFixed(1)}% is below the mandatory ${policy.minAttendancePercentage}% requirement.`
      );
    }
  }

  // 2. Backlog Attempts Check
  if (record.backlogAttempt > policy.maxBacklogAttempts) {
    reasonCodes.push("MAX_ATTEMPTS_EXCEEDED");
    reasons.push(
      `Maximum backlog attempts exceeded: Attempt ${record.backlogAttempt} exceeds the institutional maximum limit of ${policy.maxBacklogAttempts}.`
    );
  }

  // 3. Fee Clearance Check
  if (policy.requireFeeClearance && record.feeClearanceStatus === "BLOCKED") {
    reasonCodes.push("FEE_DUE_BLOCK");
    reasons.push("Examination registration blocked due to outstanding academic fee dues.");
  }

  const isEligible = reasonCodes.length === 0;

  if (isEligible && reasons.length === 0) {
    reasons.push("Fully eligible: attendance and academic prerequisites satisfied.");
  }

  return {
    studentId: record.studentId,
    rollNumber: record.rollNumber,
    subjectCode: record.subjectCode,
    isEligible,
    reasonCodes,
    reasons,
    ruleVersion: policy.ruleVersion,
    evaluatedAt: new Date().toISOString(),
  };
}
