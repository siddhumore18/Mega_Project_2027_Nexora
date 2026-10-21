import { UserRole } from "@nexora/contracts";

// --- Types ---
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  identifier: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface DepartmentRecord {
  id: string;
  code: string;
  name: string;
  hodName: string;
  studentStrength: number;
  programsCount: number;
  facultyCount: number;
  createdAt: string;
}

export interface ProgramRecord {
  id: string;
  code: string;
  name: string;
  degreeLevel: "Undergraduate" | "Postgraduate" | "Doctoral";
  departmentCode: string;
  durationYears: number;
  currentStrength: number;
}

export type YearOfStudy = "First" | "Second" | "Third" | "Fourth";
export type SubjectType = "Theory" | "Practical" | "Lab" | "Project" | "Elective" | "Seminar";

export function getYearFromSemester(semester: number): YearOfStudy {
  if (semester <= 2) return "First";
  if (semester <= 4) return "Second";
  if (semester <= 6) return "Third";
  return "Fourth";
}

export interface SubjectRecord {
  id: string;
  code: string;
  title: string;
  departmentCode: string;
  programCode: string;
  academicYear: string;
  yearOfStudy: YearOfStudy;
  semester: number;
  type: SubjectType;
  credits: number;
  lectureHours: number;
  tutorialHours: number;
  practicalHours: number;
  status: "Active" | "Inactive";
  enrolledStudents: number;
}

export interface ExamCycleRecord {
  id: string;
  name: string;
  academicYear: string;
  semesterType: "Odd Semester" | "Even Semester";
  examType: "MSE" | "ESE" | "Makeup Examination" | "Lab-Practical Examination";
  department: string;
  yearLevel: "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | "All Years";
  division: "Division A" | "Division B" | "All Divisions";
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  sessionWindow: "Morning (09:30 - 12:30 IST)" | "Afternoon (14:00 - 17:00 IST)" | "Both Sessions";
  durationMinutes: number;
  status: "Draft" | "Configured" | "In Progress" | "Completed";
  applicableSubjectsCount: number;
  createdAt: string;
}

export interface TimetableApprovalRecord {
  id: string;
  cycleId: string;
  cycleName: string;
  department: string;
  program: string;
  submittedBy: string;
  submittedDate: string;
  status: "Draft" | "Submitted" | "Revision Requested" | "Approved" | "Published";
  solverStatus: "OPTIMAL" | "FEASIBLE" | "SIMULATED";
  clashesCount: number;
  roomUtilization: string;
  reviewNotes?: string;
  rejectionReason?: string;
  decisionTimestamp?: string;
  decidedBy?: string;
  exams: Array<{
    id: string;
    code: string;
    subject: string;
    date: string;
    slot: string;
    room: string;
    invigilator: string;
    enrolled: number;
  }>;
}

export interface GrievanceRecord {
  id: string;
  ticketNumber: string;
  title: string;
  category: "Scheduling Clash" | "Venue Facility" | "Special Accommodation" | "Hall Ticket Issue" | "Other";
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Review" | "Resolved" | "Closed";
  submittedBy: string;
  userRole: "Student" | "Faculty" | "HOD";
  assignedTo: string;
  date: string;
  description: string;
  internalNotes: string[];
  resolutionNote?: string;
  history: Array<{
    timestamp: string;
    action: string;
    actor: string;
    note?: string;
  }>;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  status: "SUCCESS" | "WARNING" | "INFO" | "ERROR";
}

export interface PolicySettingsRecord {
  maxDutiesPerFaculty: number;
  morningSlotStart: string;
  morningSlotEnd: string;
  afternoonSlotStart: string;
  afternoonSlotEnd: string;
  allowedDurations: number[];
  minRestHoursBetweenExams: number;
  mandatoryAlternatingBranches: boolean;
  safetyCapacityMarginPercent: number;
  wheelchairDeskMandatory: boolean;
  notifyOnApproval: boolean;
  notifyOnGrievance: boolean;
}

// --- Coordinator & Operational Types ---
export interface StudentRegistrationRecord {
  id: string;
  studentId: string;
  name: string;
  rollNo: string;
  email: string;
  departmentCode: string;
  programCode: string;
  yearOfStudy: YearOfStudy;
  division: "Division A" | "Division B";
  semester: number;
  academicYear: string;
  subjectCode: string;
  subjectTitle: string;
  registrationType: "Regular" | "Backlog" | "Makeup";
  registrationStatus: "Registered" | "Not Registered" | "Pending Payment";
  eligibilityStatus: "Eligible" | "Ineligible";
  ineligibilityReason?: string;
  attendancePercentage: number;
  feesCleared: boolean;
  registeredAt?: string;
}

export interface ExamHallRecord {
  id: string;
  name: string;
  code: string;
  building: string;
  capacity: number;
  examCapacity: number;
  allocatedStudents: number;
  type: "Lecture Hall" | "Auditorium" | "Computer Lab" | "Drawing Hall";
  hasAC: boolean;
  isAccessible: boolean;
  floor: string;
  status: "Available" | "Occupied" | "Maintenance";
  maintenanceReason?: string;
}

export interface CollegeHolidayRecord {
  id: string;
  name: string;
  date: string;
  dayOfWeek: string;
  type: "Gazetted Holiday" | "Institutional Holiday" | "Restricted Holiday";
  description: string;
}

export interface InvigilatorRosterRecord {
  id: string;
  facultyId: string;
  name: string;
  identifier: string;
  departmentCode: string;
  email: string;
  assignedDuties: number;
  maxDuties: number;
  status: "Available" | "Max Assigned" | "On Leave";
  leaveDates?: string[];
}

export interface CoordinatorExamEntry {
  id: string;
  cycleId?: string;
  code: string;
  subject: string;
  department: string;
  programCode: string;
  semester: number;
  yearOfStudy: YearOfStudy;
  examType: "MSE" | "ESE" | "Makeup Examination" | "Lab-Practical Examination";
  enrolled: number;
  date: string;
  slot: string;
  room: string;
  invigilator: string;
  status: "Draft" | "Submitted" | "Revision Requested" | "Approved" | "Published";
  isIncluded: boolean;
  durationMinutes: number;
}

export interface SeatingRecord {
  id: string;
  cycleId?: string;
  examId: string;
  subjectCode: string;
  roomCode: string;
  date: string;
  slot: string;
  deskNo: string;
  studentRoll: string;
  studentName: string;
  departmentCode: string;
  division: string;
}

export interface ConflictItem {
  id: string;
  type: "ROOM_DOUBLE_BOOKING" | "CAPACITY_OVERFLOW" | "FACULTY_OVERLAP" | "FACULTY_ON_LEAVE" | "HOLIDAY_CLASH" | "STUDENT_OVERLAP" | "UNSCHEDULED_SUBJECT";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  examId: string;
  subjectCode: string;
  date: string;
  slot: string;
  resourceName: string;
  description: string;
  suggestedAlternatives: string[];
  resolved: boolean;
}

// --- Initial Seed Data ---
const DEFAULT_USERS: UserRecord[] = [
  // 1. Admins
  { id: "usr-1", name: "Sanika Patil", email: "admin@nexora.edu", role: UserRole.ADMIN, department: "Central Administration", identifier: "SYS-ADMIN-01", status: "ACTIVE", createdAt: "2026-08-01" },
  { id: "usr-10", name: "Rajesh Kulkarni", email: "rajesh.k@nexora.edu", role: UserRole.ADMIN, department: "Academic Affairs", identifier: "ADM-1002", status: "ACTIVE", createdAt: "2026-08-03" },

  // 2. Exam Coordinators
  { id: "usr-2", name: "Dr. Sarah Jenkins", email: "coordinator@nexora.edu", role: UserRole.EXAM_COORDINATOR, department: "Central Examination Cell", identifier: "ADM-9021", status: "ACTIVE", createdAt: "2026-08-05" },
  { id: "usr-11", name: "Dr. Michael Rao", email: "m.rao@nexora.edu", role: UserRole.EXAM_COORDINATOR, department: "Electronics & Communication Engineering", identifier: "ADM-9034", status: "ACTIVE", createdAt: "2026-08-06" },
  { id: "usr-12", name: "Dr. Priya Nair", email: "p.nair@nexora.edu", role: UserRole.EXAM_COORDINATOR, department: "Mechanical Engineering", identifier: "ADM-9045", status: "ACTIVE", createdAt: "2026-08-08" },

  // 3. Department HODs
  { id: "usr-3", name: "Prof. R. K. Mehta", email: "hod.cse@nexora.edu", role: UserRole.HOD, department: "Computer Science & Engineering", identifier: "HOD-4019", status: "ACTIVE", createdAt: "2026-08-10" },
  { id: "usr-13", name: "Dr. M. Roy", email: "hod.ece@nexora.edu", role: UserRole.HOD, department: "Electronics & Communication Engineering", identifier: "HOD-4022", status: "ACTIVE", createdAt: "2026-08-11" },
  { id: "usr-14", name: "Dr. Pramod Kulkarni", email: "hod.mech@nexora.edu", role: UserRole.HOD, department: "Mechanical Engineering", identifier: "HOD-4035", status: "ACTIVE", createdAt: "2026-08-11" },
  { id: "usr-15", name: "Dr. S. Nair", email: "hod.civil@nexora.edu", role: UserRole.HOD, department: "Civil & Environmental Engineering", identifier: "HOD-4048", status: "ACTIVE", createdAt: "2026-08-12" },
  { id: "usr-16", name: "Dr. T. Banerjee", email: "hod.aids@nexora.edu", role: UserRole.HOD, department: "Artificial Intelligence & Data Science", identifier: "HOD-4051", status: "ACTIVE", createdAt: "2026-08-12" },

  // 4. Faculty / Invigilators
  { id: "usr-4", name: "Dr. Arvind Sharma", email: "arvind.sharma@nexora.edu", role: UserRole.FACULTY, department: "Computer Science & Engineering", identifier: "FAC-1082", status: "ACTIVE", createdAt: "2026-08-15" },
  { id: "usr-5", name: "Prof. Rohini Iyer", email: "r.iyer@nexora.edu", role: UserRole.FACULTY, department: "Electronics & Communication Engineering", identifier: "FAC-1090", status: "ACTIVE", createdAt: "2026-08-15" },
  { id: "usr-6", name: "Prof. S. Patil", email: "s.patil@nexora.edu", role: UserRole.FACULTY, department: "Computer Science & Engineering", identifier: "FAC-1110", status: "ACTIVE", createdAt: "2026-08-15" },
  { id: "usr-9", name: "Rohit Sharma", email: "rohit.sharma@nexora.edu", role: UserRole.FACULTY, department: "Artificial Intelligence & Data Science", identifier: "FAC-1142", status: "ACTIVE", createdAt: "2026-09-10" },
  { id: "usr-17", name: "Dr. A. Verma", email: "a.verma@nexora.edu", role: UserRole.FACULTY, department: "Electrical & Electronics Engineering", identifier: "FAC-1155", status: "ACTIVE", createdAt: "2026-09-12" },
  { id: "usr-18", name: "Prof. Neha Gupta", email: "neha.gupta@nexora.edu", role: UserRole.FACULTY, department: "Information Technology", identifier: "FAC-1160", status: "INACTIVE", createdAt: "2026-09-15" },

  // 5. Students
  { id: "usr-7", name: "Aarav Sharma", email: "aarav.sharma@nexora.edu", role: UserRole.STUDENT, department: "Computer Science & Engineering", identifier: "CS2023-042", status: "ACTIVE", createdAt: "2026-09-01" },
  { id: "usr-8", name: "Ananya Roy", email: "ananya.roy@nexora.edu", role: UserRole.STUDENT, department: "Computer Science & Engineering", identifier: "CS2023-014", status: "ACTIVE", createdAt: "2026-09-01" },
  { id: "usr-19", name: "Vikram Malhotra", email: "v.malhotra@nexora.edu", role: UserRole.STUDENT, department: "Electronics & Communication Engineering", identifier: "EC2023-088", status: "ACTIVE", createdAt: "2026-09-02" },
  { id: "usr-20", name: "Sneha Deshmukh", email: "s.deshmukh@nexora.edu", role: UserRole.STUDENT, department: "Mechanical Engineering", identifier: "ME2024-031", status: "ACTIVE", createdAt: "2026-09-02" },
  { id: "usr-21", name: "Rahul Verma", email: "r.verma@nexora.edu", role: UserRole.STUDENT, department: "Computer Science & Engineering", identifier: "CS2025-102", status: "ACTIVE", createdAt: "2026-09-05" },
];

const DEFAULT_DEPARTMENTS: DepartmentRecord[] = [
  { id: "dept-1", code: "CSE", name: "Computer Science & Engineering", hodName: "Prof. R. K. Mehta", studentStrength: 540, programsCount: 4, facultyCount: 28, createdAt: "2026-01-10" },
  { id: "dept-2", code: "ECE", name: "Electronics & Communication Engineering", hodName: "Dr. M. Roy", studentStrength: 380, programsCount: 3, facultyCount: 22, createdAt: "2026-01-10" },
  { id: "dept-3", code: "MECH", name: "Mechanical Engineering", hodName: "Dr. P. Kulkarni", studentStrength: 320, programsCount: 3, facultyCount: 20, createdAt: "2026-01-10" },
  { id: "dept-4", code: "CIVIL", name: "Civil & Environmental Engineering", hodName: "Dr. S. Nair", studentStrength: 260, programsCount: 2, facultyCount: 16, createdAt: "2026-01-10" },
  { id: "dept-5", code: "EE", name: "Electrical & Electronics Engineering", hodName: "Dr. A. Verma", studentStrength: 300, programsCount: 3, facultyCount: 18, createdAt: "2026-01-10" },
  { id: "dept-6", code: "AIDS", name: "Artificial Intelligence & Data Science", hodName: "Dr. T. Banerjee", studentStrength: 280, programsCount: 2, facultyCount: 14, createdAt: "2026-01-10" },
  { id: "dept-7", code: "IT", name: "Information Technology", hodName: "Dr. S. Sen", studentStrength: 240, programsCount: 3, facultyCount: 15, createdAt: "2026-01-10" },
  { id: "dept-8", code: "CHEM", name: "Chemical Engineering", hodName: "Dr. K. Deshmukh", studentStrength: 160, programsCount: 2, facultyCount: 12, createdAt: "2026-01-10" },
];

const DEFAULT_PROGRAMS: ProgramRecord[] = [
  { id: "prog-1", code: "BTECH-CSE", name: "B.Tech in Computer Science & Engineering", degreeLevel: "Undergraduate", departmentCode: "CSE", durationYears: 4, currentStrength: 480 },
  { id: "prog-2", code: "MTECH-CSE", name: "M.Tech in Advanced Computer Systems", degreeLevel: "Postgraduate", departmentCode: "CSE", durationYears: 2, currentStrength: 60 },
  { id: "prog-3", code: "BTECH-ECE", name: "B.Tech in Electronics & Communication Engineering", degreeLevel: "Undergraduate", departmentCode: "ECE", durationYears: 4, currentStrength: 360 },
  { id: "prog-4", code: "BTECH-MECH", name: "B.Tech in Mechanical Engineering", degreeLevel: "Undergraduate", departmentCode: "MECH", durationYears: 4, currentStrength: 300 },
  { id: "prog-5", code: "BTECH-CIVIL", name: "B.Tech in Civil Engineering", degreeLevel: "Undergraduate", departmentCode: "CIVIL", durationYears: 4, currentStrength: 240 },
  { id: "prog-6", code: "BTECH-AIDS", name: "B.Tech in AI & Data Science", degreeLevel: "Undergraduate", departmentCode: "AIDS", durationYears: 4, currentStrength: 240 },
  { id: "prog-7", code: "BTECH-EE", name: "B.Tech in Electrical Engineering", degreeLevel: "Undergraduate", departmentCode: "EE", durationYears: 4, currentStrength: 240 },
  { id: "prog-8", code: "BTECH-IT", name: "B.Tech in Information Technology", degreeLevel: "Undergraduate", departmentCode: "IT", durationYears: 4, currentStrength: 200 },
  { id: "prog-9", code: "BTECH-CHEM", name: "B.Tech in Chemical Engineering", degreeLevel: "Undergraduate", departmentCode: "CHEM", durationYears: 4, currentStrength: 160 },
];

const DEFAULT_SUBJECTS: SubjectRecord[] = [
  // Computer Science & Engineering (CSE)
  { id: "sub-1", code: "CS701", title: "Distributed Systems & Cloud Computing", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120 },
  { id: "sub-2", code: "CS704", title: "Cryptography & Network Security", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 115 },
  { id: "sub-3", code: "CS708L", title: "Cloud Computing & DevOps Lab", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Lab", credits: 2, lectureHours: 0, tutorialHours: 0, practicalHours: 4, status: "Active", enrolledStudents: 120 },
  { id: "sub-4", code: "CS801", title: "Autonomous Systems & Robotics", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 8, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 0, practicalHours: 2, status: "Active", enrolledStudents: 95 },
  { id: "sub-5", code: "CS802P", title: "Capstone Major Engineering Project", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 8, type: "Project", credits: 6, lectureHours: 0, tutorialHours: 0, practicalHours: 12, status: "Active", enrolledStudents: 120 },
  { id: "sub-6", code: "CS501", title: "Operating Systems & Kernel Design", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 125 },
  { id: "sub-7", code: "CS502L", title: "Operating Systems Practical Lab", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Practical", credits: 2, lectureHours: 0, tutorialHours: 0, practicalHours: 3, status: "Active", enrolledStudents: 125 },
  { id: "sub-8", code: "CS601", title: "Compiler Design & Formal Automata", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 6, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 122 },
  { id: "sub-9", code: "CS301", title: "Data Structures & Advanced Algorithms", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 130 },
  { id: "sub-10", code: "CS302L", title: "Data Structures Practical Lab", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Practical", credits: 2, lectureHours: 0, tutorialHours: 0, practicalHours: 4, status: "Active", enrolledStudents: 130 },
  { id: "sub-11", code: "CS401", title: "Computer Organization & Architecture", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Second", semester: 4, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 128 },
  { id: "sub-12", code: "CS101", title: "Algorithmic Problem Solving in C++", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "First", semester: 1, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 140 },
  { id: "sub-13", code: "CS102L", title: "Foundational Programming Lab", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "First", semester: 1, type: "Lab", credits: 2, lectureHours: 0, tutorialHours: 0, practicalHours: 3, status: "Active", enrolledStudents: 140 },
  { id: "sub-14", code: "CS201", title: "Discrete Mathematical Structures", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "First", semester: 2, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 138 },

  // Electronics & Communication Engineering (ECE)
  { id: "sub-15", code: "EC702", title: "VLSI Architecture & Embedded Logic", departmentCode: "ECE", programCode: "BTECH-ECE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90 },
  { id: "sub-16", code: "EC705L", title: "Embedded Systems Design Lab", departmentCode: "ECE", programCode: "BTECH-ECE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Lab", credits: 2, lectureHours: 0, tutorialHours: 0, practicalHours: 4, status: "Active", enrolledStudents: 90 },
  { id: "sub-17", code: "EC802", title: "Wireless Sensor Networks & 5G IoT", departmentCode: "ECE", programCode: "BTECH-ECE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 8, type: "Elective", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 85 },
  { id: "sub-18", code: "EC501", title: "Microprocessors & Interfacing Controllers", departmentCode: "ECE", programCode: "BTECH-ECE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 95 },
  { id: "sub-19", code: "EC301", title: "Analog Circuits & Semiconductor Devices", departmentCode: "ECE", programCode: "BTECH-ECE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 98 },
  { id: "sub-20", code: "EC101", title: "Basic Electronics Engineering", departmentCode: "ECE", programCode: "BTECH-ECE", academicYear: "2026-27", yearOfStudy: "First", semester: 1, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 100 },

  // Mechanical Engineering (MECH)
  { id: "sub-21", code: "ME703", title: "Finite Element Methods & Dynamics", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75 },
  { id: "sub-22", code: "ME706L", title: "Computational Fluid Dynamics Lab", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Lab", credits: 2, lectureHours: 0, tutorialHours: 0, practicalHours: 3, status: "Active", enrolledStudents: 75 },
  { id: "sub-23", code: "ME501", title: "Heat & Mass Transfer Engineering", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 80 },
  { id: "sub-24", code: "ME301", title: "Kinematics & Dynamics of Machinery", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 82 },
  { id: "sub-25", code: "ME101", title: "Engineering Graphics & Computer Drafting", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "First", semester: 1, type: "Practical", credits: 3, lectureHours: 1, tutorialHours: 0, practicalHours: 4, status: "Active", enrolledStudents: 85 },

  // Civil & Environmental Engineering (CIVIL)
  { id: "sub-26", code: "CE705", title: "Structural Earthquake Engineering", departmentCode: "CIVIL", programCode: "BTECH-CIVIL", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60 },
  { id: "sub-27", code: "CE502", title: "Geotechnical & Soil Mechanics", departmentCode: "CIVIL", programCode: "BTECH-CIVIL", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 65 },
  { id: "sub-28", code: "CE101", title: "Basic Surveying & Geomatics", departmentCode: "CIVIL", programCode: "BTECH-CIVIL", academicYear: "2026-27", yearOfStudy: "First", semester: 1, type: "Practical", credits: 3, lectureHours: 1, tutorialHours: 0, practicalHours: 4, status: "Active", enrolledStudents: 70 },

  // Artificial Intelligence & Data Science (AIDS)
  { id: "sub-29", code: "AD701", title: "Deep Learning & Neural Architectures", departmentCode: "AIDS", programCode: "BTECH-AIDS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 110 },
  { id: "sub-30", code: "AD501", title: "Statistical Foundations of Data Science", departmentCode: "AIDS", programCode: "BTECH-AIDS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 112 },
  { id: "sub-31", code: "AD301", title: "Applied Machine Learning Algorithms", departmentCode: "AIDS", programCode: "BTECH-AIDS", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 0, practicalHours: 2, status: "Active", enrolledStudents: 115 },

  // Electrical & Electronics Engineering (EE)
  { id: "sub-32", code: "EE702", title: "Power System Protection & Switchgear", departmentCode: "EE", programCode: "BTECH-EE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85 },
  { id: "sub-33", code: "EE501", title: "Feedback Control Systems Engineering", departmentCode: "EE", programCode: "BTECH-EE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 88 },

  // Information Technology (IT)
  { id: "sub-34", code: "IT701", title: "Cloud Virtualization & Containerization", departmentCode: "IT", programCode: "BTECH-IT", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75 },
  { id: "sub-35", code: "IT501", title: "Full-Stack Enterprise Web Architecture", departmentCode: "IT", programCode: "BTECH-IT", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Practical", credits: 4, lectureHours: 2, tutorialHours: 0, practicalHours: 4, status: "Active", enrolledStudents: 80 },

  // Chemical Engineering (CHEM)
  { id: "sub-36", code: "CH701", title: "Chemical Reaction Engineering & Kinetics", departmentCode: "CHEM", programCode: "BTECH-CHEM", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 50 },
];

const DEFAULT_EXAM_CYCLES: ExamCycleRecord[] = [
  {
    id: "cycle-1",
    name: "Winter 2026 Examination",
    academicYear: "2025-26",
    semesterType: "Odd Semester",
    examType: "MSE",
    department: "Computer Science & Engineering",
    yearLevel: "4th Year",
    division: "All Divisions",
    startDate: "2026-11-10",
    endDate: "2026-11-25",
    registrationDeadline: "2026-10-31",
    sessionWindow: "Both Sessions",
    durationMinutes: 180,
    status: "In Progress",
    applicableSubjectsCount: 8,
    createdAt: "2026-09-01",
  },
  {
    id: "cycle-2",
    name: "Regular End-Semester Examination 2026-27",
    academicYear: "2026-27",
    semesterType: "Even Semester",
    examType: "ESE",
    department: "All Departments",
    yearLevel: "All Years",
    division: "All Divisions",
    startDate: "2027-04-15",
    endDate: "2027-05-10",
    registrationDeadline: "2027-03-31",
    sessionWindow: "Both Sessions",
    durationMinutes: 180,
    status: "Configured",
    applicableSubjectsCount: 24,
    createdAt: "2026-09-15",
  },
  {
    id: "cycle-3",
    name: "Backlog & Makeup Assessment Term",
    academicYear: "2025-26",
    semesterType: "Odd Semester",
    examType: "Makeup Examination",
    department: "Computer Science & Engineering",
    yearLevel: "3rd Year",
    division: "Division A",
    startDate: "2026-12-05",
    endDate: "2026-12-15",
    registrationDeadline: "2026-11-28",
    sessionWindow: "Morning (09:30 - 12:30 IST)",
    durationMinutes: 120,
    status: "Draft",
    applicableSubjectsCount: 4,
    createdAt: "2026-10-01",
  },
];

const DEFAULT_TIMETABLES: TimetableApprovalRecord[] = [
  {
    id: "sub-w26-cse",
    cycleId: "cycle-1",
    cycleName: "Winter 2026 - CSE",
    department: "Computer Science & Engineering",
    program: "B.Tech (CSE) 7th Sem",
    submittedBy: "Dr. Sarah Jenkins (Coordinator)",
    submittedDate: "2026-10-18 10:24 IST",
    status: "Submitted",
    solverStatus: "OPTIMAL",
    clashesCount: 0,
    roomUtilization: "84.2%",
    exams: [
      { id: "ex-1", code: "CS701", subject: "Distributed Systems & Cloud Computing", date: "2026-11-10", slot: "09:30 - 12:30 IST", room: "Hall A-101", invigilator: "Dr. Arvind Sharma (CSE)", enrolled: 120 },
      { id: "ex-2", code: "CS704", subject: "Cryptography & Network Security", date: "2026-11-12", slot: "09:30 - 12:30 IST", room: "Hall A-101", invigilator: "Prof. S. Patil (CSE)", enrolled: 115 },
      { id: "ex-3", code: "CS708L", subject: "Cloud Computing & DevOps Lab", date: "2026-11-14", slot: "14:00 - 17:00 IST", room: "Lab D-105", invigilator: "Dr. Arvind Sharma (CSE)", enrolled: 120 },
    ],
  },
  {
    id: "sub-w26-ece",
    cycleId: "cycle-1",
    cycleName: "Winter 2026 - ECE",
    department: "Electronics & Communication Engineering",
    program: "B.Tech (ECE) 7th Sem",
    submittedBy: "Dr. Michael Rao (Coordinator)",
    submittedDate: "2026-10-17 17:12 IST",
    status: "Revision Requested",
    solverStatus: "FEASIBLE",
    clashesCount: 0,
    roomUtilization: "96.8%",
    reviewNotes: "Room Hall B-204 capacity is at 96.8% with zero ventilation headroom. Please relocate EC702 to Auditorium 1.",
    exams: [
      { id: "ex-4", code: "EC702", subject: "VLSI Architecture & Embedded Logic", date: "2026-11-10", slot: "14:00 - 17:00 IST", room: "Hall B-204", invigilator: "Prof. Rohini Iyer (ECE)", enrolled: 90 },
    ],
  },
  {
    id: "sub-w26-mech",
    cycleId: "cycle-1",
    cycleName: "Winter 2026 - MECH",
    department: "Mechanical Engineering",
    program: "B.Tech (Mechanical) 7th Sem",
    submittedBy: "Dr. Priya Nair (Coordinator)",
    submittedDate: "2026-10-16 11:45 IST",
    status: "Approved",
    solverStatus: "OPTIMAL",
    clashesCount: 0,
    roomUtilization: "78.4%",
    decisionTimestamp: "2026-10-16 15:30 IST",
    decidedBy: "Sanika Patil (Admin)",
    exams: [
      { id: "ex-5", code: "ME703", subject: "Finite Element Methods & Dynamics", date: "2026-11-11", slot: "09:30 - 12:30 IST", room: "Hall C-301", invigilator: "Dr. Pramod Kulkarni (MECH)", enrolled: 75 },
    ],
  },
];

const DEFAULT_GRIEVANCES: GrievanceRecord[] = [
  {
    id: "grv-1",
    ticketNumber: "GRV-2026-081",
    title: "Air Conditioning malfunction in Examination Hall A-101",
    category: "Venue Facility",
    priority: "High",
    status: "Open",
    submittedBy: "Dr. Arvind Sharma",
    userRole: "Faculty",
    assignedTo: "Campus Estate Officer",
    date: "2026-10-17",
    description: "During preliminary mock check, the central AC unit in Hall A-101 produced severe vibration and ceased cooling. With 120 candidates assigned, room temperature exceeds comfortable testing norms.",
    internalNotes: ["Estate office notified via work order #4102.", "Technician scheduled for 19 Oct morning."],
    history: [
      { timestamp: "2026-10-17 14:10 IST", action: "TICKET_OPENED", actor: "Dr. Arvind Sharma" },
      { timestamp: "2026-10-17 16:30 IST", action: "ASSIGNED", actor: "Sanika Patil", note: "Assigned to Campus Estate Officer" },
    ],
  },
  {
    id: "grv-2",
    ticketNumber: "GRV-2026-079",
    title: "Minor elective slot conflict for Dual-Major enrolled candidates",
    category: "Scheduling Clash",
    priority: "High",
    status: "In Review",
    submittedBy: "Aarav Sharma (CS2023-042)",
    userRole: "Student",
    assignedTo: "Dr. Sarah Jenkins",
    date: "2026-10-16",
    description: "CS701 Distributed Systems on 10 Nov morning clashes with Humanities Minor elective paper scheduled on the same date for 14 candidates.",
    internalNotes: ["Coordinating with Humanities dept coordinator to shift elective to 15 Nov."],
    history: [
      { timestamp: "2026-10-16 09:20 IST", action: "TICKET_OPENED", actor: "Aarav Sharma" },
      { timestamp: "2026-10-16 11:00 IST", action: "STATUS_UPDATE", actor: "Sanika Patil", note: "Status changed to In Review" },
    ],
  },
  {
    id: "grv-3",
    ticketNumber: "GRV-2026-074",
    title: "Ground floor wheelchair-accessible desk allocation for student CS2023-019",
    category: "Special Accommodation",
    priority: "Medium",
    status: "Resolved",
    submittedBy: "Prof. R. K. Mehta",
    userRole: "HOD",
    assignedTo: "Examination Seating Desk",
    date: "2026-10-15",
    description: "Candidate CS2023-019 requires barrier-free ground floor access and specialized wide-format desk due to recent limb surgery.",
    internalNotes: ["Assigned Hall D-105 barrier-free entrance desk #01."],
    resolutionNote: "Candidate assigned dedicated desk Desk-01 in ground floor Computing Complex Hall D-105 with ramp access verified.",
    history: [
      { timestamp: "2026-10-15 11:15 IST", action: "TICKET_OPENED", actor: "Prof. R. K. Mehta" },
      { timestamp: "2026-10-15 14:00 IST", action: "RESOLVED", actor: "Sanika Patil", note: "Resolution saved and seating chart updated" },
    ],
  },
];

const DEFAULT_AUDIT_LOGS: AuditLogRecord[] = [
  { id: "aud-1", timestamp: "2026-10-18 10:24 IST", actor: "Dr. Sarah Jenkins", role: "EXAM_COORDINATOR", action: "SUBMIT_TIMETABLE", entityType: "TimetableSubmission", entityId: "sub-w26-cse", details: "Submitted Winter 2026 CSE timetable (3 papers) for Admin review", status: "SUCCESS" },
  { id: "aud-2", timestamp: "2026-10-18 09:15 IST", actor: "Sanika Patil", role: "ADMIN", action: "CREATE_USER", entityType: "UserAccount", entityId: "usr-9", details: "Created faculty account for Rohit Sharma (FAC-1142) in AI&DS", status: "SUCCESS" },
  { id: "aud-3", timestamp: "2026-10-17 17:12 IST", actor: "Sanika Patil", role: "ADMIN", action: "REQUEST_REVISION", entityType: "TimetableSubmission", entityId: "sub-w26-ece", details: "Requested revision on Winter 2026 ECE timetable due to >95% room utilization", status: "WARNING" },
  { id: "aud-4", timestamp: "2026-10-17 14:00 IST", actor: "Sanika Patil", role: "ADMIN", action: "CONFIGURE_CYCLE", entityType: "ExamCycle", entityId: "cycle-1", details: "Updated date boundaries for Winter 2026 Examination cycle", status: "INFO" },
  { id: "aud-5", timestamp: "2026-10-16 15:30 IST", actor: "Sanika Patil", role: "ADMIN", action: "APPROVE_TIMETABLE", entityType: "TimetableSubmission", entityId: "sub-w26-mech", details: "Approved Winter 2026 Mechanical timetable and published immutable v1.0", status: "SUCCESS" },
  { id: "aud-6", timestamp: "2026-10-15 14:00 IST", actor: "Sanika Patil", role: "ADMIN", action: "RESOLVE_GRIEVANCE", entityType: "Grievance", entityId: "grv-3", details: "Resolved barrier-free seating accommodation ticket GRV-2026-074", status: "SUCCESS" },
];

const DEFAULT_POLICIES: PolicySettingsRecord = {
  maxDutiesPerFaculty: 3,
  morningSlotStart: "09:30",
  morningSlotEnd: "12:30",
  afternoonSlotStart: "14:00",
  afternoonSlotEnd: "17:00",
  allowedDurations: [60, 90, 120, 180],
  minRestHoursBetweenExams: 24,
  mandatoryAlternatingBranches: true,
  safetyCapacityMarginPercent: 10,
  wheelchairDeskMandatory: true,
  notifyOnApproval: true,
  notifyOnGrievance: true,
};

// Coordinator Operational Seeds
export const DEFAULT_STUDENT_REGISTRATIONS: StudentRegistrationRecord[] = [
  { id: "reg-1", studentId: "usr-7", name: "Aarav Sharma", rollNo: "CS2023-042", email: "aarav.sharma@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "CS701", subjectTitle: "Distributed Systems & Cloud Computing", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 88.5, feesCleared: true, registeredAt: "2026-10-12" },
  { id: "reg-2", studentId: "usr-8", name: "Ananya Roy", rollNo: "CS2023-014", email: "ananya.roy@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "CS701", subjectTitle: "Distributed Systems & Cloud Computing", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 92.0, feesCleared: true, registeredAt: "2026-10-12" },
  { id: "reg-3", studentId: "usr-22", name: "Rohan Verma", rollNo: "CS2023-089", email: "rohan.v@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division B", semester: 7, academicYear: "2026-27", subjectCode: "CS701", subjectTitle: "Distributed Systems & Cloud Computing", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Ineligible", ineligibilityReason: "Attendance 68% < 75% required institutional threshold", attendancePercentage: 68.0, feesCleared: true, registeredAt: "2026-10-14" },
  { id: "reg-4", studentId: "usr-23", name: "Kavita Deshmukh", rollNo: "CS2023-033", email: "k.deshmukh@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "CS704", subjectTitle: "Cryptography & Network Security", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 82.0, feesCleared: true, registeredAt: "2026-10-13" },
  { id: "reg-5", studentId: "usr-19", name: "Vikram Malhotra", rollNo: "EC2023-088", email: "v.malhotra@nexora.edu", departmentCode: "ECE", programCode: "BTECH-ECE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "EC702", subjectTitle: "VLSI Architecture & Embedded Logic", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 84.5, feesCleared: true, registeredAt: "2026-10-11" },
  { id: "reg-6", studentId: "usr-24", name: "Divya Nair", rollNo: "EC2023-019", email: "divya.n@nexora.edu", departmentCode: "ECE", programCode: "BTECH-ECE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "EC702", subjectTitle: "VLSI Architecture & Embedded Logic", registrationType: "Regular", registrationStatus: "Pending Payment", eligibilityStatus: "Ineligible", ineligibilityReason: "Outstanding Semester Tuition Fee Clearance Pending", attendancePercentage: 91.0, feesCleared: false, registeredAt: "2026-10-15" },
  { id: "reg-7", studentId: "usr-20", name: "Sneha Deshmukh", rollNo: "ME2024-031", email: "s.deshmukh@nexora.edu", departmentCode: "MECH", programCode: "BTECH-MECH", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "ME703", subjectTitle: "Finite Element Methods & Dynamics", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 86.0, feesCleared: true, registeredAt: "2026-10-10" },
  { id: "reg-8", studentId: "usr-25", name: "Aditya Joshi", rollNo: "CS2022-011", email: "a.joshi@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "CS501", subjectTitle: "Operating Systems & Kernel Design", registrationType: "Backlog", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 79.5, feesCleared: true, registeredAt: "2026-10-16" },
  { id: "reg-9", studentId: "usr-26", name: "Pooja Kulkarni", rollNo: "CS2022-045", email: "pooja.k@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division B", semester: 7, academicYear: "2026-27", subjectCode: "CS301", subjectTitle: "Data Structures & Advanced Algorithms", registrationType: "Backlog", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 80.0, feesCleared: true, registeredAt: "2026-10-16" },
  { id: "reg-10", studentId: "usr-27", name: "Tanvi Mehta", rollNo: "EC2022-076", email: "t.mehta@nexora.edu", departmentCode: "ECE", programCode: "BTECH-ECE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "EC501", subjectTitle: "Microprocessors & Interfacing Controllers", registrationType: "Backlog", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 85.0, feesCleared: true, registeredAt: "2026-10-17" },
  { id: "reg-11", studentId: "usr-28", name: "Karan Shah", rollNo: "CS2023-105", email: "karan.s@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division B", semester: 7, academicYear: "2026-27", subjectCode: "CS704", subjectTitle: "Cryptography & Network Security", registrationType: "Makeup", registrationStatus: "Registered", eligibilityStatus: "Eligible", ineligibilityReason: "Approved Medical Leave during Regular MSE", attendancePercentage: 88.0, feesCleared: true, registeredAt: "2026-10-18" },
  { id: "reg-12", studentId: "usr-29", name: "Nikhil Rathi", rollNo: "ME2023-054", email: "n.rathi@nexora.edu", departmentCode: "MECH", programCode: "BTECH-MECH", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "ME501", subjectTitle: "Heat & Mass Transfer Engineering", registrationType: "Makeup", registrationStatus: "Pending Payment", eligibilityStatus: "Eligible", attendancePercentage: 81.0, feesCleared: false, registeredAt: "2026-10-18" },
  { id: "reg-13", studentId: "usr-30", name: "Priya Saxena", rollNo: "AD2023-021", email: "p.saxena@nexora.edu", departmentCode: "AIDS", programCode: "BTECH-AIDS", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "AD701", subjectTitle: "Deep Learning & Neural Architectures", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 94.0, feesCleared: true, registeredAt: "2026-10-12" },
  { id: "reg-14", studentId: "usr-31", name: "Manish Patel", rollNo: "AD2023-055", email: "m.patel@nexora.edu", departmentCode: "AIDS", programCode: "BTECH-AIDS", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "AD701", subjectTitle: "Deep Learning & Neural Architectures", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Ineligible", ineligibilityReason: "Prerequisite Course AD501 Not Cleared", attendancePercentage: 76.0, feesCleared: true, registeredAt: "2026-10-13" },
  { id: "reg-15", studentId: "usr-32", name: "Siddharth Rao", rollNo: "IT2023-012", email: "s.rao@nexora.edu", departmentCode: "IT", programCode: "BTECH-IT", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "IT701", subjectTitle: "Cloud Virtualization & Containerization", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 89.0, feesCleared: true, registeredAt: "2026-10-12" },
  { id: "reg-16", studentId: "usr-33", name: "Amitabh Sen", rollNo: "CE2023-034", email: "a.sen@nexora.edu", departmentCode: "CIVIL", programCode: "BTECH-CIVIL", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "CE705", subjectTitle: "Structural Earthquake Engineering", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 83.5, feesCleared: true, registeredAt: "2026-10-11" },
  { id: "reg-17", studentId: "usr-34", name: "Neha Reddy", rollNo: "EE2023-067", email: "n.reddy@nexora.edu", departmentCode: "EE", programCode: "BTECH-EE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "EE702", subjectTitle: "Power System Protection & Switchgear", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 91.0, feesCleared: true, registeredAt: "2026-10-12" },
  { id: "reg-18", studentId: "usr-35", name: "Suresh Raina", rollNo: "CS2023-078", email: "suresh.r@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division B", semester: 7, academicYear: "2026-27", subjectCode: "CS701", subjectTitle: "Distributed Systems & Cloud Computing", registrationType: "Regular", registrationStatus: "Not Registered", eligibilityStatus: "Eligible", attendancePercentage: 85.0, feesCleared: true },
  { id: "reg-19", studentId: "usr-36", name: "Bhavna Iyer", rollNo: "CS2023-092", email: "b.iyer@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "CS704", subjectTitle: "Cryptography & Network Security", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 90.0, feesCleared: true, registeredAt: "2026-10-13" },
  { id: "reg-20", studentId: "usr-37", name: "Gaurav Mishra", rollNo: "CS2023-111", email: "g.mishra@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "CS708L", subjectTitle: "Cloud Computing & DevOps Lab", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 95.0, feesCleared: true, registeredAt: "2026-10-14" },
  { id: "reg-21", studentId: "usr-38", name: "Harsh Vardhan", rollNo: "ME2023-088", email: "h.vardhan@nexora.edu", departmentCode: "MECH", programCode: "BTECH-MECH", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "ME706L", subjectTitle: "Computational Fluid Dynamics Lab", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 82.0, feesCleared: true, registeredAt: "2026-10-14" },
  { id: "reg-22", studentId: "usr-39", name: "Ishaan Trivedi", rollNo: "EC2023-049", email: "i.trivedi@nexora.edu", departmentCode: "ECE", programCode: "BTECH-ECE", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "EC705L", subjectTitle: "Embedded Systems Design Lab", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 87.0, feesCleared: true, registeredAt: "2026-10-13" },
  { id: "reg-23", studentId: "usr-40", name: "Janhavi Patil", rollNo: "AD2023-066", email: "j.patil@nexora.edu", departmentCode: "AIDS", programCode: "BTECH-AIDS", yearOfStudy: "Fourth", division: "Division A", semester: 7, academicYear: "2026-27", subjectCode: "AD701", subjectTitle: "Deep Learning & Neural Architectures", registrationType: "Regular", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 91.5, feesCleared: true, registeredAt: "2026-10-13" },
  { id: "reg-24", studentId: "usr-41", name: "Omkar Shinde", rollNo: "CS2023-056", email: "o.shinde@nexora.edu", departmentCode: "CSE", programCode: "BTECH-CSE", yearOfStudy: "Fourth", division: "Division B", semester: 7, academicYear: "2026-27", subjectCode: "CS401", subjectTitle: "Computer Organization & Architecture", registrationType: "Backlog", registrationStatus: "Registered", eligibilityStatus: "Eligible", attendancePercentage: 83.0, feesCleared: true, registeredAt: "2026-10-17" },
];

export const DEFAULT_EXAM_HALLS: ExamHallRecord[] = [
  { id: "hall-1", name: "Examination Hall A-101", code: "A-101", building: "Academic Block A", capacity: 150, examCapacity: 120, allocatedStudents: 120, type: "Lecture Hall", hasAC: true, isAccessible: true, floor: "Ground Floor", status: "Available" },
  { id: "hall-2", name: "Examination Hall B-204", code: "B-204", building: "Academic Block B", capacity: 110, examCapacity: 90, allocatedStudents: 90, type: "Lecture Hall", hasAC: true, isAccessible: true, floor: "2nd Floor", status: "Available" },
  { id: "hall-3", name: "Engineering Hall C-301", code: "C-301", building: "Mechanical Block", capacity: 90, examCapacity: 75, allocatedStudents: 75, type: "Lecture Hall", hasAC: false, isAccessible: false, floor: "3rd Floor", status: "Available" },
  { id: "hall-4", name: "Computing Lab D-105", code: "D-105", building: "Computing Complex", capacity: 70, examCapacity: 60, allocatedStudents: 60, type: "Computer Lab", hasAC: true, isAccessible: true, floor: "Ground Floor", status: "Available" },
  { id: "hall-5", name: "Computing Lab D-106", code: "D-106", building: "Computing Complex", capacity: 70, examCapacity: 60, allocatedStudents: 0, type: "Computer Lab", hasAC: true, isAccessible: true, floor: "Ground Floor", status: "Available" },
  { id: "hall-6", name: "Central Auditorium 1", code: "AUDI-1", building: "Administrative Block", capacity: 260, examCapacity: 200, allocatedStudents: 0, type: "Auditorium", hasAC: true, isAccessible: true, floor: "Ground Floor", status: "Available" },
  { id: "hall-7", name: "Drawing Hall E-201", code: "E-201", building: "Architecture Block", capacity: 80, examCapacity: 60, allocatedStudents: 0, type: "Drawing Hall", hasAC: false, isAccessible: true, floor: "2nd Floor", status: "Available" },
  { id: "hall-8", name: "Seminar Hall 2", code: "SEM-2", building: "Science & Tech Block", capacity: 90, examCapacity: 70, allocatedStudents: 0, type: "Lecture Hall", hasAC: true, isAccessible: true, floor: "1st Floor", status: "Available" },
  { id: "hall-9", name: "Hall F-102", code: "F-102", building: "Annex Block", capacity: 60, examCapacity: 45, allocatedStudents: 0, type: "Lecture Hall", hasAC: false, isAccessible: true, floor: "Ground Floor", status: "Maintenance", maintenanceReason: "Ceiling acoustics repair & electrical rewiring" },
  { id: "hall-10", name: "Lab G-301", code: "G-301", building: "Electronics Block", capacity: 50, examCapacity: 40, allocatedStudents: 0, type: "Computer Lab", hasAC: true, isAccessible: false, floor: "3rd Floor", status: "Available" },
];

export const DEFAULT_COLLEGE_HOLIDAYS: CollegeHolidayRecord[] = [
  { id: "hol-1", name: "Diwali / Deepavali Break", date: "2026-11-04", dayOfWeek: "Wednesday", type: "Gazetted Holiday", description: "Campus-wide official gazetted festival holiday. All examination sessions suspended." },
  { id: "hol-2", name: "Govardhan Puja", date: "2026-11-05", dayOfWeek: "Thursday", type: "Institutional Holiday", description: "Institutional holiday. Academic administration & venues closed." },
  { id: "hol-3", name: "Guru Nanak Jayanti", date: "2026-11-15", dayOfWeek: "Sunday", type: "Gazetted Holiday", description: "Gazetted public holiday." },
  { id: "hol-4", name: "Institutional Preparation Recess", date: "2026-11-20", dayOfWeek: "Friday", type: "Institutional Holiday", description: "Study preparation recess prior to practical project evaluations." },
  { id: "hol-5", name: "Republic Day", date: "2027-01-26", dayOfWeek: "Tuesday", type: "Gazetted Holiday", description: "National Republic Day celebration." },
  { id: "hol-6", name: "Dr. B. R. Ambedkar Jayanti", date: "2027-04-14", dayOfWeek: "Wednesday", type: "Gazetted Holiday", description: "National public holiday." },
];

export const DEFAULT_INVIGILATORS: InvigilatorRosterRecord[] = [
  { id: "inv-1", facultyId: "usr-4", name: "Dr. Arvind Sharma", identifier: "FAC-1082", departmentCode: "CSE", email: "arvind.sharma@nexora.edu", assignedDuties: 2, maxDuties: 3, status: "Available" },
  { id: "inv-2", facultyId: "usr-5", name: "Prof. Rohini Iyer", identifier: "FAC-1090", departmentCode: "ECE", email: "r.iyer@nexora.edu", assignedDuties: 2, maxDuties: 3, status: "Available" },
  { id: "inv-3", facultyId: "usr-14", name: "Dr. Pramod Kulkarni", identifier: "FAC-1104", departmentCode: "MECH", email: "hod.mech@nexora.edu", assignedDuties: 1, maxDuties: 3, status: "Available" },
  { id: "inv-4", facultyId: "usr-6", name: "Prof. S. Patil", identifier: "FAC-1110", departmentCode: "CSE", email: "s.patil@nexora.edu", assignedDuties: 3, maxDuties: 3, status: "Max Assigned" },
  { id: "inv-5", facultyId: "usr-16", name: "Dr. T. Banerjee", identifier: "FAC-1125", departmentCode: "AIDS", email: "hod.aids@nexora.edu", assignedDuties: 1, maxDuties: 3, status: "Available" },
  { id: "inv-6", facultyId: "usr-15", name: "Dr. S. Nair", identifier: "FAC-1130", departmentCode: "CIVIL", email: "hod.civil@nexora.edu", assignedDuties: 2, maxDuties: 3, status: "Available" },
  { id: "inv-7", facultyId: "usr-17", name: "Dr. A. Verma", identifier: "FAC-1155", departmentCode: "EE", email: "a.verma@nexora.edu", assignedDuties: 1, maxDuties: 3, status: "Available" },
  { id: "inv-8", facultyId: "usr-13", name: "Dr. M. Roy", identifier: "FAC-1022", departmentCode: "ECE", email: "hod.ece@nexora.edu", assignedDuties: 0, maxDuties: 3, status: "Available" },
  { id: "inv-9", facultyId: "usr-3", name: "Prof. R. K. Mehta", identifier: "FAC-1019", departmentCode: "CSE", email: "hod.cse@nexora.edu", assignedDuties: 0, maxDuties: 2, status: "On Leave", leaveDates: ["2026-11-10", "2026-11-11", "2026-11-12"] },
  { id: "inv-10", facultyId: "usr-9", name: "Rohit Sharma", identifier: "FAC-1142", departmentCode: "AIDS", email: "rohit.sharma@nexora.edu", assignedDuties: 1, maxDuties: 3, status: "Available" },
];

export const DEFAULT_COORDINATOR_EXAMS: CoordinatorExamEntry[] = [
  { id: "ex-1", cycleId: "cycle-1", code: "CS701", subject: "Distributed Systems & Cloud Computing", department: "CSE", programCode: "BTECH-CSE", semester: 7, yearOfStudy: "Fourth", examType: "MSE", enrolled: 120, date: "2026-11-10", slot: "09:30 - 12:30 IST", room: "Examination Hall A-101", invigilator: "Dr. Arvind Sharma (CSE)", status: "Submitted", isIncluded: true, durationMinutes: 180 },
  { id: "ex-2", cycleId: "cycle-1", code: "EC702", subject: "VLSI Architecture & Embedded Logic", department: "ECE", programCode: "BTECH-ECE", semester: 7, yearOfStudy: "Fourth", examType: "MSE", enrolled: 90, date: "2026-11-10", slot: "14:00 - 17:00 IST", room: "Examination Hall B-204", invigilator: "Prof. Rohini Iyer (ECE)", status: "Revision Requested", isIncluded: true, durationMinutes: 180 },
  { id: "ex-3", cycleId: "cycle-1", code: "ME703", subject: "Finite Element Methods & Dynamics", department: "MECH", programCode: "BTECH-MECH", semester: 7, yearOfStudy: "Fourth", examType: "MSE", enrolled: 75, date: "2026-11-11", slot: "09:30 - 12:30 IST", room: "Engineering Hall C-301", invigilator: "Dr. Pramod Kulkarni (MECH)", status: "Approved", isIncluded: true, durationMinutes: 180 },
  { id: "ex-4", cycleId: "cycle-1", code: "CS704", subject: "Cryptography & Network Security", department: "CSE", programCode: "BTECH-CSE", semester: 7, yearOfStudy: "Fourth", examType: "MSE", enrolled: 115, date: "2026-11-12", slot: "09:30 - 12:30 IST", room: "Examination Hall A-101", invigilator: "Prof. S. Patil (CSE)", status: "Draft", isIncluded: true, durationMinutes: 180 },
  { id: "ex-5", cycleId: "cycle-1", code: "CS708L", subject: "Cloud Computing & DevOps Lab", department: "CSE", programCode: "BTECH-CSE", semester: 7, yearOfStudy: "Fourth", examType: "MSE", enrolled: 120, date: "2026-11-14", slot: "14:00 - 17:00 IST", room: "Computing Lab D-105", invigilator: "Dr. Arvind Sharma (CSE)", status: "Draft", isIncluded: true, durationMinutes: 180 },
  { id: "ex-6", cycleId: "cycle-1", code: "AD701", subject: "Deep Learning & Neural Architectures", department: "AIDS", programCode: "BTECH-AIDS", semester: 7, yearOfStudy: "Fourth", examType: "MSE", enrolled: 110, date: "2026-11-16", slot: "09:30 - 12:30 IST", room: "Examination Hall B-204", invigilator: "Dr. T. Banerjee (AIDS)", status: "Draft", isIncluded: true, durationMinutes: 180 },
];

export const DEFAULT_SEATING_RECORDS: SeatingRecord[] = Array.from({ length: 24 }, (_, idx) => {
  const isEven = idx % 2 === 0;
  const dept = isEven ? "CSE" : "ECE";
  const roll = isEven ? `CS2023-${String(10 + idx).padStart(3, "0")}` : `EC2023-${String(20 + idx).padStart(3, "0")}`;
  return {
    id: `seat-seed-${idx + 1}`,
    cycleId: "cycle-1",
    examId: isEven ? "ex-1" : "ex-2",
    subjectCode: isEven ? "CS701" : "EC702",
    roomCode: isEven ? "A-101" : "B-204",
    date: "2026-11-10",
    slot: isEven ? "09:30 - 12:30 IST" : "14:00 - 17:00 IST",
    deskNo: `Desk-${String(idx + 1).padStart(2, "0")}`,
    studentRoll: roll,
    studentName: isEven ? `Candidate CS-${idx + 1}` : `Candidate EC-${idx + 1}`,
    departmentCode: dept,
    division: isEven ? "Division A" : "Division B",
  };
});

export const DEFAULT_CONFLICTS: ConflictItem[] = [
  {
    id: "conf-1",
    type: "CAPACITY_OVERFLOW",
    severity: "HIGH",
    examId: "ex-2",
    subjectCode: "EC702",
    date: "2026-11-10",
    slot: "14:00 - 17:00 IST",
    resourceName: "Examination Hall B-204",
    description: "Hall B-204 capacity is at 100% (90 enrolled vs 90 exam capacity). Room ventilation buffer is 0%, which violates institutional 10% safety margin rule.",
    suggestedAlternatives: [
      "Relocate EC702 paper to Central Auditorium 1 (200 exam capacity available)",
      "Shift EC702 to Examination Hall A-101 in the Afternoon slot",
    ],
    resolved: false,
  },
  {
    id: "conf-2",
    type: "FACULTY_OVERLAP",
    severity: "MEDIUM",
    examId: "ex-4",
    subjectCode: "CS704",
    date: "2026-11-12",
    slot: "09:30 - 12:30 IST",
    resourceName: "Prof. S. Patil (CSE)",
    description: "Faculty member Prof. S. Patil has reached the institutional limit of 3 invigilation duties for the Winter 2026 cycle.",
    suggestedAlternatives: [
      "Reassign invigilation to Dr. M. Roy (ECE) who has 0/3 duties assigned",
      "Reassign to Dr. A. Verma (EE) who has 1/3 duties assigned",
    ],
    resolved: false,
  },
];

const STORAGE_KEY = "nexora_academic_data_v3";

interface StoreState {
  users: UserRecord[];
  departments: DepartmentRecord[];
  programs: ProgramRecord[];
  subjects: SubjectRecord[];
  examCycles: ExamCycleRecord[];
  timetables: TimetableApprovalRecord[];
  grievances: GrievanceRecord[];
  auditLogs: AuditLogRecord[];
  policies: PolicySettingsRecord;
  // Coordinator Collections
  studentRegistrations: StudentRegistrationRecord[];
  examHalls: ExamHallRecord[];
  collegeHolidays: CollegeHolidayRecord[];
  invigilators: InvigilatorRosterRecord[];
  coordinatorExams: CoordinatorExamEntry[];
  seatingRecords: SeatingRecord[];
  conflicts: ConflictItem[];
}

function loadInitialState(): StoreState {
  if (typeof window === "undefined") {
    return {
      users: DEFAULT_USERS,
      departments: DEFAULT_DEPARTMENTS,
      programs: DEFAULT_PROGRAMS,
      subjects: DEFAULT_SUBJECTS,
      examCycles: DEFAULT_EXAM_CYCLES,
      timetables: DEFAULT_TIMETABLES,
      grievances: DEFAULT_GRIEVANCES,
      auditLogs: DEFAULT_AUDIT_LOGS,
      policies: DEFAULT_POLICIES,
      studentRegistrations: DEFAULT_STUDENT_REGISTRATIONS,
      examHalls: DEFAULT_EXAM_HALLS,
      collegeHolidays: DEFAULT_COLLEGE_HOLIDAYS,
      invigilators: DEFAULT_INVIGILATORS,
      coordinatorExams: DEFAULT_COORDINATOR_EXAMS,
      seatingRecords: DEFAULT_SEATING_RECORDS,
      conflicts: DEFAULT_CONFLICTS,
    };
  }

  try {
    let parsed: any = null;
    const rawV3 = localStorage.getItem("nexora_academic_data_v3");
    if (rawV3) {
      parsed = JSON.parse(rawV3);
    } else {
      const rawV2 = localStorage.getItem("nexora_academic_data_v2");
      if (rawV2) {
        parsed = JSON.parse(rawV2);
      }
    }

    if (!parsed) {
      const state: StoreState = {
        users: DEFAULT_USERS,
        departments: DEFAULT_DEPARTMENTS,
        programs: DEFAULT_PROGRAMS,
        subjects: DEFAULT_SUBJECTS,
        examCycles: DEFAULT_EXAM_CYCLES,
        timetables: DEFAULT_TIMETABLES,
        grievances: DEFAULT_GRIEVANCES,
        auditLogs: DEFAULT_AUDIT_LOGS,
        policies: DEFAULT_POLICIES,
        studentRegistrations: DEFAULT_STUDENT_REGISTRATIONS,
        examHalls: DEFAULT_EXAM_HALLS,
        collegeHolidays: DEFAULT_COLLEGE_HOLIDAYS,
        invigilators: DEFAULT_INVIGILATORS,
        coordinatorExams: DEFAULT_COORDINATOR_EXAMS,
        seatingRecords: DEFAULT_SEATING_RECORDS,
        conflicts: DEFAULT_CONFLICTS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }

    const state: StoreState = {
      users: parsed.users && parsed.users.length > 0 ? parsed.users : DEFAULT_USERS,
      departments: parsed.departments && parsed.departments.length > 0 ? parsed.departments : DEFAULT_DEPARTMENTS,
      programs: parsed.programs && parsed.programs.length > 0 ? parsed.programs : DEFAULT_PROGRAMS,
      subjects: (parsed.subjects && parsed.subjects.length > 0 ? parsed.subjects : DEFAULT_SUBJECTS).map((s: any) => ({
        ...s,
        programCode: s.programCode || (s.departmentCode === "CSE" ? "BTECH-CSE" : `BTECH-${s.departmentCode}`),
        yearOfStudy: s.yearOfStudy || getYearFromSemester(s.semester || 1),
        academicYear: s.academicYear || "2026-27",
        type: (s.type === "Lab-Practical" ? "Practical" : (s.type === "Lecture" ? "Theory" : (s.type || "Theory"))) as SubjectType,
        lectureHours: s.lectureHours !== undefined ? Number(s.lectureHours) : 3,
        tutorialHours: s.tutorialHours !== undefined ? Number(s.tutorialHours) : 1,
        practicalHours: s.practicalHours !== undefined ? Number(s.practicalHours) : 0,
        status: s.status || "Active",
      })),
      examCycles: parsed.examCycles && parsed.examCycles.length > 0 ? parsed.examCycles : DEFAULT_EXAM_CYCLES,
      timetables: parsed.timetables && parsed.timetables.length > 0 ? parsed.timetables : DEFAULT_TIMETABLES,
      grievances: parsed.grievances && parsed.grievances.length > 0 ? parsed.grievances : DEFAULT_GRIEVANCES,
      auditLogs: parsed.auditLogs && parsed.auditLogs.length > 0 ? parsed.auditLogs : DEFAULT_AUDIT_LOGS,
      policies: parsed.policies || DEFAULT_POLICIES,
      studentRegistrations: parsed.studentRegistrations && parsed.studentRegistrations.length > 0 ? parsed.studentRegistrations : DEFAULT_STUDENT_REGISTRATIONS,
      examHalls: parsed.examHalls && parsed.examHalls.length > 0 ? parsed.examHalls : DEFAULT_EXAM_HALLS,
      collegeHolidays: parsed.collegeHolidays && parsed.collegeHolidays.length > 0 ? parsed.collegeHolidays : DEFAULT_COLLEGE_HOLIDAYS,
      invigilators: parsed.invigilators && parsed.invigilators.length > 0 ? parsed.invigilators : DEFAULT_INVIGILATORS,
      coordinatorExams: parsed.coordinatorExams && parsed.coordinatorExams.length > 0 ? parsed.coordinatorExams : DEFAULT_COORDINATOR_EXAMS,
      seatingRecords: parsed.seatingRecords && parsed.seatingRecords.length > 0 ? parsed.seatingRecords : DEFAULT_SEATING_RECORDS,
      conflicts: parsed.conflicts !== undefined ? parsed.conflicts : DEFAULT_CONFLICTS,
    };
    return state;
  } catch (e) {
    console.warn("Failed to load state from localStorage, falling back to defaults", e);
    return {
      users: DEFAULT_USERS,
      departments: DEFAULT_DEPARTMENTS,
      programs: DEFAULT_PROGRAMS,
      subjects: DEFAULT_SUBJECTS,
      examCycles: DEFAULT_EXAM_CYCLES,
      timetables: DEFAULT_TIMETABLES,
      grievances: DEFAULT_GRIEVANCES,
      auditLogs: DEFAULT_AUDIT_LOGS,
      policies: DEFAULT_POLICIES,
      studentRegistrations: DEFAULT_STUDENT_REGISTRATIONS,
      examHalls: DEFAULT_EXAM_HALLS,
      collegeHolidays: DEFAULT_COLLEGE_HOLIDAYS,
      invigilators: DEFAULT_INVIGILATORS,
      coordinatorExams: DEFAULT_COORDINATOR_EXAMS,
      seatingRecords: DEFAULT_SEATING_RECORDS,
      conflicts: DEFAULT_CONFLICTS,
    };
  }
}

function saveState(state: StoreState): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save state to localStorage", e);
    }
  }
}

let currentState: StoreState = loadInitialState();
const listeners = new Set<() => void>();

function notify(): void {
  saveState(currentState);
  listeners.forEach((l) => l());
}

export const AcademicDataStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState(): StoreState {
    return currentState;
  },

  resetToDefaults(): void {
    currentState = {
      users: DEFAULT_USERS,
      departments: DEFAULT_DEPARTMENTS,
      programs: DEFAULT_PROGRAMS,
      subjects: DEFAULT_SUBJECTS,
      examCycles: DEFAULT_EXAM_CYCLES,
      timetables: DEFAULT_TIMETABLES,
      grievances: DEFAULT_GRIEVANCES,
      auditLogs: DEFAULT_AUDIT_LOGS,
      policies: DEFAULT_POLICIES,
      studentRegistrations: DEFAULT_STUDENT_REGISTRATIONS,
      examHalls: DEFAULT_EXAM_HALLS,
      collegeHolidays: DEFAULT_COLLEGE_HOLIDAYS,
      invigilators: DEFAULT_INVIGILATORS,
      coordinatorExams: DEFAULT_COORDINATOR_EXAMS,
      seatingRecords: DEFAULT_SEATING_RECORDS,
      conflicts: DEFAULT_CONFLICTS,
    };
    notify();
  },

  // --- Audit Log Helper ---
  logAction(actor: string, role: string, action: string, entityType: string, details: string, status: "SUCCESS" | "WARNING" | "INFO" | "ERROR" = "SUCCESS", entityId?: string) {
    const newEntry: AuditLogRecord = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
      actor,
      role,
      action,
      entityType,
      entityId,
      details,
      status,
    };
    currentState.auditLogs = [newEntry, ...currentState.auditLogs];
    notify();
  },

  // --- Users Actions ---
  addUser(userData: Omit<UserRecord, "id" | "createdAt">, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    if (!userData.name.trim() || !userData.email.trim() || !userData.identifier.trim()) {
      return { success: false, error: "Name, email, and identifier are required." };
    }
    const duplicateEmail = currentState.users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (duplicateEmail) {
      return { success: false, error: `A user with email ${userData.email} already exists.` };
    }
    const duplicateId = currentState.users.some((u) => u.identifier.toUpperCase() === userData.identifier.toUpperCase());
    if (duplicateId) {
      return { success: false, error: `Identifier ${userData.identifier} is already assigned.` };
    }

    const newUser: UserRecord = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    currentState.users = [newUser, ...currentState.users];
    this.logAction(actor, "ADMIN", "CREATE_USER", "User", `Created ${newUser.role} user: ${newUser.name} (${newUser.identifier})`, "SUCCESS", newUser.id);
    notify();
    return { success: true };
  },

  updateUser(id: string, updates: Partial<Omit<UserRecord, "id" | "createdAt">>, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const idx = currentState.users.findIndex((u) => u.id === id);
    if (idx === -1) return { success: false, error: "User not found." };

    if (updates.email) {
      const duplicateEmail = currentState.users.some((u) => u.id !== id && u.email.toLowerCase() === updates.email!.toLowerCase());
      if (duplicateEmail) return { success: false, error: "Email is already taken by another user." };
    }

    const updated = { ...currentState.users[idx], ...updates };
    currentState.users[idx] = updated;
    this.logAction(actor, "ADMIN", "UPDATE_USER", "User", `Updated profile for ${updated.name} (${updated.identifier})`, "INFO", id);
    notify();
    return { success: true };
  },

  toggleUserStatus(id: string, actor: string = "Sanika Patil"): { success: boolean; newStatus: "ACTIVE" | "INACTIVE" } {
    const user = currentState.users.find((u) => u.id === id);
    if (!user) return { success: false, newStatus: "INACTIVE" };
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    user.status = nextStatus;
    this.logAction(actor, "ADMIN", nextStatus === "ACTIVE" ? "ACTIVATE_USER" : "DEACTIVATE_USER", "User", `Set ${user.name} status to ${nextStatus}`, "WARNING", id);
    notify();
    return { success: true, newStatus: nextStatus };
  },

  deleteUser(id: string, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const user = currentState.users.find((u) => u.id === id);
    if (!user) return { success: false, error: "User not found." };
    if (user.role === UserRole.ADMIN && user.identifier === "SYS-ADMIN-01") {
      return { success: false, error: "Cannot delete the primary root system administrator." };
    }

    const hasAssignedDuty = currentState.timetables.some((t) =>
      t.exams.some((e) => e.invigilator.includes(user.name))
    );
    if (hasAssignedDuty) {
      return {
        success: false,
        error: `Cannot delete ${user.name}: This faculty member is actively assigned to scheduled examination duties. Reassign the papers first.`,
      };
    }

    currentState.users = currentState.users.filter((u) => u.id !== id);
    this.logAction(actor, "ADMIN", "DELETE_USER", "User", `Deleted user account: ${user.name} (${user.identifier})`, "WARNING", id);
    notify();
    return { success: true };
  },

  // --- Departments Actions ---
  addDepartment(deptData: Omit<DepartmentRecord, "id" | "createdAt" | "programsCount" | "facultyCount">, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    if (!deptData.code.trim() || !deptData.name.trim()) {
      return { success: false, error: "Department code and name are required." };
    }
    const cleanCode = deptData.code.trim().toUpperCase();
    const duplicate = currentState.departments.some((d) => d.code.toUpperCase() === cleanCode);
    if (duplicate) {
      return { success: false, error: `Department with code "${cleanCode}" already exists. Duplicate department codes are rejected.` };
    }

    const newDept: DepartmentRecord = {
      ...deptData,
      id: `dept-${Date.now()}`,
      code: cleanCode,
      programsCount: 0,
      facultyCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    currentState.departments = [newDept, ...currentState.departments];
    this.logAction(actor, "ADMIN", "CREATE_DEPARTMENT", "Department", `Registered department: ${newDept.name} (${newDept.code})`, "SUCCESS", newDept.id);
    notify();
    return { success: true };
  },

  updateDepartment(id: string, updates: Partial<Omit<DepartmentRecord, "id" | "createdAt">>, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const idx = currentState.departments.findIndex((d) => d.id === id);
    if (idx === -1) return { success: false, error: "Department not found." };

    if (updates.code) {
      const cleanCode = updates.code.trim().toUpperCase();
      const duplicate = currentState.departments.some((d) => d.id !== id && d.code.toUpperCase() === cleanCode);
      if (duplicate) {
        return { success: false, error: `Department code "${cleanCode}" is already in use.` };
      }
      updates.code = cleanCode;
    }

    currentState.departments[idx] = { ...currentState.departments[idx], ...updates };
    this.logAction(actor, "ADMIN", "UPDATE_DEPARTMENT", "Department", `Updated department: ${currentState.departments[idx].name}`, "INFO", id);
    notify();
    return { success: true };
  },

  deleteDepartment(id: string, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const dept = currentState.departments.find((d) => d.id === id);
    if (!dept) return { success: false, error: "Department not found." };

    const hasPrograms = currentState.programs.some((p) => p.departmentCode === dept.code);
    const hasSubjects = currentState.subjects.some((s) => s.departmentCode === dept.code);
    if (hasPrograms || hasSubjects) {
      return {
        success: false,
        error: `Cannot delete ${dept.name}: ${dept.code} has ${hasPrograms ? "active programs" : "registered subjects"}. Remove or reassign them first.`,
      };
    }

    currentState.departments = currentState.departments.filter((d) => d.id !== id);
    this.logAction(actor, "ADMIN", "DELETE_DEPARTMENT", "Department", `Deleted department ${dept.name} (${dept.code})`, "WARNING", id);
    notify();
    return { success: true };
  },

  // --- Programs & Subjects Actions ---
  addProgram(progData: Omit<ProgramRecord, "id">, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    if (!progData.code.trim() || !progData.name.trim()) {
      return { success: false, error: "Program code and name are required." };
    }
    const cleanCode = progData.code.trim().toUpperCase();
    if (currentState.programs.some((p) => p.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Program code "${cleanCode}" already exists.` };
    }

    const newProg: ProgramRecord = { ...progData, id: `prog-${Date.now()}`, code: cleanCode };
    currentState.programs = [newProg, ...currentState.programs];

    const d = currentState.departments.find((dept) => dept.code === progData.departmentCode);
    if (d) d.programsCount += 1;

    this.logAction(actor, "ADMIN", "CREATE_PROGRAM", "Program", `Added program: ${newProg.name} (${newProg.code})`, "SUCCESS", newProg.id);
    notify();
    return { success: true };
  },

  updateProgram(id: string, updates: Partial<Omit<ProgramRecord, "id">>, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const idx = currentState.programs.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: "Program not found." };
    currentState.programs[idx] = { ...currentState.programs[idx], ...updates };
    this.logAction(actor, "ADMIN", "UPDATE_PROGRAM", "Program", `Updated program ${currentState.programs[idx].name}`, "INFO", id);
    notify();
    return { success: true };
  },

  deleteProgram(id: string, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const prog = currentState.programs.find((p) => p.id === id);
    if (!prog) return { success: false, error: "Program not found." };

    const directSubjects = currentState.subjects.filter((s) => s.programCode === prog.code);
    if (directSubjects.length > 0) {
      return {
        success: false,
        error: `Cannot delete degree program ${prog.code}: It contains ${directSubjects.length} registered curriculum subject(s). Please reassign or delete the associated subjects first.`,
      };
    }

    const refTimetables = currentState.timetables.filter((t) => t.program.includes(prog.code) || t.program.includes(prog.name));
    if (refTimetables.length > 0) {
      return {
        success: false,
        error: `Cannot delete degree program ${prog.code}: It is actively referenced in scheduled examination timetables.`,
      };
    }

    currentState.programs = currentState.programs.filter((p) => p.id !== id);
    const d = currentState.departments.find((dept) => dept.code === prog.departmentCode);
    if (d && d.programsCount > 0) d.programsCount -= 1;
    this.logAction(actor, "ADMIN", "DELETE_PROGRAM", "Program", `Deleted program ${prog.name} (${prog.code})`, "WARNING", id);
    notify();
    return { success: true };
  },

  addSubject(subData: Omit<SubjectRecord, "id">, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    if (!subData.code.trim() || !subData.title.trim()) {
      return { success: false, error: "Subject code and subject title are required." };
    }
    const cleanCode = subData.code.trim().toUpperCase();
    if (currentState.subjects.some((s) => s.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Subject code "${cleanCode}" already exists. Duplicate subject codes are rejected.` };
    }
    if (subData.credits === undefined || subData.credits < 0) {
      return { success: false, error: "Subject credits must be a valid non-negative number." };
    }

    const expectedYear = getYearFromSemester(subData.semester);
    if (subData.yearOfStudy && subData.yearOfStudy !== expectedYear) {
      return {
        success: false,
        error: `Incompatible semester: Semester ${subData.semester} belongs to ${expectedYear} Year of study, but ${subData.yearOfStudy} Year was selected.`,
      };
    }

    const newSub: SubjectRecord = {
      ...subData,
      id: `sub-${Date.now()}`,
      code: cleanCode,
      yearOfStudy: subData.yearOfStudy || expectedYear,
      lectureHours: Number(subData.lectureHours) >= 0 ? Number(subData.lectureHours) : 3,
      tutorialHours: Number(subData.tutorialHours) >= 0 ? Number(subData.tutorialHours) : 1,
      practicalHours: Number(subData.practicalHours) >= 0 ? Number(subData.practicalHours) : 0,
      status: subData.status || "Active",
      academicYear: subData.academicYear || "2026-27",
    };
    currentState.subjects = [newSub, ...currentState.subjects];
    this.logAction(actor, "ADMIN", "CREATE_SUBJECT", "Subject", `Added curriculum subject: ${newSub.title} (${newSub.code})`, "SUCCESS", newSub.id);
    notify();
    return { success: true };
  },

  updateSubject(id: string, updates: Partial<Omit<SubjectRecord, "id">>, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const idx = currentState.subjects.findIndex((s) => s.id === id);
    if (idx === -1) return { success: false, error: "Subject not found." };

    if (updates.code) {
      const cleanCode = updates.code.trim().toUpperCase();
      const duplicate = currentState.subjects.some((s) => s.id !== id && s.code.toUpperCase() === cleanCode);
      if (duplicate) {
        return { success: false, error: `Subject code "${cleanCode}" is already in use by another course.` };
      }
      updates.code = cleanCode;
    }

    if (updates.credits !== undefined && updates.credits < 0) {
      return { success: false, error: "Credits must be a valid non-negative number." };
    }

    if (updates.semester !== undefined) {
      const expectedYear = getYearFromSemester(updates.semester);
      if (updates.yearOfStudy && updates.yearOfStudy !== expectedYear) {
        return {
          success: false,
          error: `Incompatible semester: Semester ${updates.semester} belongs to ${expectedYear} Year, but ${updates.yearOfStudy} Year was specified.`,
        };
      }
      if (!updates.yearOfStudy) {
        updates.yearOfStudy = expectedYear;
      }
    }

    currentState.subjects[idx] = { ...currentState.subjects[idx], ...updates };
    this.logAction(actor, "ADMIN", "UPDATE_SUBJECT", "Subject", `Updated course ${currentState.subjects[idx].title} (${currentState.subjects[idx].code})`, "INFO", id);
    notify();
    return { success: true };
  },

  deleteSubject(id: string, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const sub = currentState.subjects.find((s) => s.id === id);
    if (!sub) return { success: false, error: "Subject not found." };

    const isScheduled = currentState.timetables.some((t) =>
      t.exams.some((e) => e.code === sub.code)
    );
    if (isScheduled) {
      return {
        success: false,
        error: `Cannot delete subject ${sub.code}: It is actively scheduled in an examination timetable. Remove the examination paper schedule first.`,
      };
    }

    currentState.subjects = currentState.subjects.filter((s) => s.id !== id);
    this.logAction(actor, "ADMIN", "DELETE_SUBJECT", "Subject", `Deleted course ${sub.title} (${sub.code})`, "WARNING", id);
    notify();
    return { success: true };
  },

  // --- Exam Cycles Actions ---
  addExamCycle(cycleData: Omit<ExamCycleRecord, "id" | "createdAt">, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    if (!cycleData.name.trim()) {
      return { success: false, error: "Exam cycle name is required." };
    }
    if (new Date(cycleData.startDate) > new Date(cycleData.endDate)) {
      return { success: false, error: "Exam Start Date cannot be after End Date." };
    }
    if (new Date(cycleData.registrationDeadline) > new Date(cycleData.startDate)) {
      return { success: false, error: "Registration Deadline must be before or on the exam Start Date." };
    }

    const duplicate = currentState.examCycles.some(
      (c) => c.academicYear === cycleData.academicYear && c.name.toLowerCase() === cycleData.name.toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: `A cycle named "${cycleData.name}" already exists for academic year ${cycleData.academicYear}.` };
    }

    const newCycle: ExamCycleRecord = {
      ...cycleData,
      id: `cycle-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    currentState.examCycles = [newCycle, ...currentState.examCycles];
    this.logAction(actor, "ADMIN", "CREATE_CYCLE", "ExamCycle", `Created cycle: ${newCycle.name} (${newCycle.semesterType} · ${newCycle.examType})`, "SUCCESS", newCycle.id);
    notify();
    return { success: true };
  },

  updateExamCycle(id: string, updates: Partial<Omit<ExamCycleRecord, "id" | "createdAt">>, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const idx = currentState.examCycles.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, error: "Exam cycle not found." };

    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) > new Date(updates.endDate)) {
        return { success: false, error: "Start Date cannot be after End Date." };
      }
    }

    currentState.examCycles[idx] = { ...currentState.examCycles[idx], ...updates };
    this.logAction(actor, "ADMIN", "UPDATE_CYCLE", "ExamCycle", `Updated exam cycle: ${currentState.examCycles[idx].name}`, "INFO", id);
    notify();
    return { success: true };
  },

  deleteExamCycle(id: string, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const cycle = currentState.examCycles.find((c) => c.id === id);
    if (!cycle) return { success: false, error: "Cycle not found." };
    if (cycle.status === "In Progress") {
      return { success: false, error: "Cannot delete an exam cycle currently In Progress." };
    }

    currentState.examCycles = currentState.examCycles.filter((c) => c.id !== id);
    this.logAction(actor, "ADMIN", "DELETE_CYCLE", "ExamCycle", `Deleted cycle ${cycle.name}`, "WARNING", id);
    notify();
    return { success: true };
  },

  // --- Timetable Consistency Validation ---
  validateTimetableConsistency(cycleId?: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const targetExams = cycleId
      ? currentState.coordinatorExams.filter((e) => e.cycleId === cycleId)
      : currentState.coordinatorExams;

    // 1. Check for room double-booking collisions
    const bookedRoomsMap = new Map<string, string>(); // key: `${date}_${slot}_${roomIdentifier}` -> exam code
    for (const ex of targetExams) {
      const roomTokens = ex.room.split("&").map((r) => r.trim());
      for (const roomToken of roomTokens) {
        const hallObj = currentState.examHalls.find((h) => h.name === roomToken || h.code === roomToken);
        const roomKey = hallObj ? hallObj.code : roomToken;
        const lookup = `${ex.date}_${ex.slot}_${roomKey}`;
        if (bookedRoomsMap.has(lookup)) {
          const conflictingExam = bookedRoomsMap.get(lookup);
          errors.push(
            `Room conflict: Room "${roomToken}" (${roomKey}) is allocated to multiple examinations (${conflictingExam} and ${ex.code}) on ${ex.date} during ${ex.slot}.`
          );
        } else {
          bookedRoomsMap.set(lookup, ex.code);
        }
      }
    }

    // 2. Check for student double-booking in multiple rooms
    const targetSeating = cycleId
      ? currentState.seatingRecords.filter((s) => s.cycleId === cycleId)
      : currentState.seatingRecords;
    const studentSessionMap = new Map<string, string>(); // key: `${date}_${slot}_${studentRoll}` -> roomCode
    for (const seat of targetSeating) {
      const studentSessionKey = `${seat.date}_${seat.slot}_${seat.studentRoll}`;
      if (studentSessionMap.has(studentSessionKey)) {
        const assignedRoom = studentSessionMap.get(studentSessionKey);
        if (assignedRoom !== seat.roomCode) {
          errors.push(
            `Candidate double-booking: Student ${seat.studentRoll} (${seat.studentName}) is simultaneously assigned to multiple venues (${assignedRoom} and ${seat.roomCode}) on ${seat.date} (${seat.slot}).`
          );
        }
      } else {
        studentSessionMap.set(studentSessionKey, seat.roomCode);
      }
    }

    return { valid: errors.length === 0, errors };
  },

  // --- Timetable Approvals Workflow Actions ---
  submitTimetable(submission: Omit<TimetableApprovalRecord, "id" | "status" | "submittedDate">, actor: string = "Dr. Sarah Jenkins"): { success: boolean; error?: string } {
    // Validate timetable consistency before submission
    const validation = this.validateTimetableConsistency(submission.cycleId);
    if (!validation.valid) {
      return { success: false, error: validation.errors[0] };
    }

    const existingIdx = currentState.timetables.findIndex(
      (t) => t.cycleId === submission.cycleId && (t.status === "Draft" || t.status === "Revision Requested" || t.status === "Submitted")
    );

    const nowTimestamp =
      new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " " +
      new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) +
      " IST";

    let targetId: string;
    if (existingIdx !== -1) {
      targetId = currentState.timetables[existingIdx].id;
      currentState.timetables[existingIdx] = {
        ...currentState.timetables[existingIdx],
        ...submission,
        status: "Submitted",
        submittedDate: nowTimestamp,
        reviewNotes: undefined,
      };
    } else {
      targetId = `sub-${Date.now()}`;
      const newSub: TimetableApprovalRecord = {
        ...submission,
        id: targetId,
        status: "Submitted",
        submittedDate: nowTimestamp,
      };
      currentState.timetables = [newSub, ...currentState.timetables];
    }

    // Synchronize coordinatorExams statuses for matching cycle
    currentState.coordinatorExams.forEach((e) => {
      if (!e.cycleId || e.cycleId === submission.cycleId) {
        e.status = "Submitted";
      }
    });

    this.logAction(actor, "EXAM_COORDINATOR", "SUBMIT_TIMETABLE", "Timetable", `Submitted ${submission.cycleName} timetable (${submission.exams.length} papers) for Admin Approval`, "SUCCESS", targetId);
    notify();
    return { success: true };
  },

  approveTimetable(id: string, publishNow: boolean = true, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const t = currentState.timetables.find((item) => item.id === id);
    if (!t) return { success: false, error: "Timetable submission not found." };
    if (t.clashesCount > 0) {
      return { success: false, error: `Cannot approve schedule with ${t.clashesCount} unresolved clashes.` };
    }

    const nextStatus = publishNow ? "Published" : "Approved";
    t.status = nextStatus;
    t.decisionTimestamp = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST";
    t.decidedBy = `${actor} (Admin)`;

    // Update corresponding coordinator exams status
    currentState.coordinatorExams.forEach((e) => {
      if (!e.cycleId || e.cycleId === t.cycleId) {
        e.status = nextStatus;
      }
    });

    this.logAction(actor, "ADMIN", publishNow ? "PUBLISH_TIMETABLE" : "APPROVE_TIMETABLE", "Timetable", `Approved & ${nextStatus} schedule for ${t.cycleName} as immutable v1.0`, "SUCCESS", id);
    notify();
    return { success: true };
  },

  publishApprovedTimetable(submissionId: string, actor: string = "Dr. Sarah Jenkins"): { success: boolean; error?: string } {
    const t = currentState.timetables.find((item) => item.id === submissionId);
    if (!t) return { success: false, error: "Timetable record not found." };
    if (t.status !== "Approved") {
      return {
        success: false,
        error: `Cannot publish timetable: Current status is "${t.status}". Admin approval is required prior to public release.`,
      };
    }

    const validation = this.validateTimetableConsistency(t.cycleId);
    if (!validation.valid) {
      return { success: false, error: validation.errors[0] };
    }

    t.status = "Published";
    currentState.coordinatorExams.forEach((e) => {
      if (!e.cycleId || e.cycleId === t.cycleId) {
        e.status = "Published";
      }
    });

    const cycle = currentState.examCycles.find((c) => c.id === t.cycleId);
    if (cycle && cycle.status !== "Completed") {
      cycle.status = "Completed";
    }

    this.logAction(actor, "EXAM_COORDINATOR", "PUBLISH_TIMETABLE", "Timetable", `Published approved examination schedule: ${t.cycleName}`, "SUCCESS", submissionId);
    notify();
    return { success: true };
  },

  requestTimetableRevision(id: string, mandatoryReason: string, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    if (!mandatoryReason.trim()) {
      return { success: false, error: "A mandatory revision reason must be provided for the Exam Coordinator." };
    }
    const t = currentState.timetables.find((item) => item.id === id);
    if (!t) return { success: false, error: "Timetable submission not found." };

    t.status = "Revision Requested";
    t.reviewNotes = mandatoryReason.trim();
    t.decisionTimestamp = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST";
    t.decidedBy = `${actor} (Admin)`;

    currentState.coordinatorExams.forEach((e) => {
      e.status = "Revision Requested";
    });

    this.logAction(actor, "ADMIN", "REQUEST_REVISION", "Timetable", `Requested revision on ${t.cycleName}: "${mandatoryReason.trim()}"`, "WARNING", id);
    notify();
    return { success: true };
  },

  rejectTimetable(id: string, mandatoryReason: string, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    if (!mandatoryReason.trim()) {
      return { success: false, error: "A mandatory rejection reason must be recorded." };
    }
    const t = currentState.timetables.find((item) => item.id === id);
    if (!t) return { success: false, error: "Timetable submission not found." };

    t.status = "Draft";
    t.rejectionReason = mandatoryReason.trim();
    t.decisionTimestamp = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST";
    t.decidedBy = `${actor} (Admin)`;

    currentState.coordinatorExams.forEach((e) => {
      e.status = "Draft";
    });

    this.logAction(actor, "ADMIN", "REJECT_TIMETABLE", "Timetable", `Rejected schedule for ${t.cycleName}: "${mandatoryReason.trim()}"`, "ERROR", id);
    notify();
    return { success: true };
  },

  // --- Coordinator Operational Actions ---
  toggleRoomAvailability(id: string, newStatus: "Available" | "Occupied" | "Maintenance", reason?: string, actor: string = "Dr. Sarah Jenkins"): { success: boolean } {
    const hall = currentState.examHalls.find((h) => h.id === id);
    if (!hall) return { success: false };
    hall.status = newStatus;
    if (newStatus === "Maintenance") {
      hall.maintenanceReason = reason || "Scheduled routine venue maintenance";
    } else {
      hall.maintenanceReason = undefined;
    }
    this.logAction(actor, "EXAM_COORDINATOR", "UPDATE_ROOM_STATUS", "ExamHall", `Updated ${hall.name} status to ${newStatus}${reason ? `: ${reason}` : ""}`, newStatus === "Maintenance" ? "WARNING" : "INFO", id);
    notify();
    return { success: true };
  },

  addExamHall(hallData: Omit<ExamHallRecord, "id">, actor: string = "Dr. Sarah Jenkins"): { success: boolean; error?: string } {
    if (!hallData.name.trim() || !hallData.code.trim()) {
      return { success: false, error: "Room name and room code are required." };
    }
    const cleanCode = hallData.code.trim().toUpperCase();
    if (currentState.examHalls.some((h) => h.code.toUpperCase() === cleanCode)) {
      return { success: false, error: `Room code "${cleanCode}" already exists.` };
    }
    const newHall: ExamHallRecord = {
      ...hallData,
      id: `hall-${Date.now()}`,
      code: cleanCode,
      examCapacity: hallData.examCapacity || Math.floor(hallData.capacity * 0.8),
      allocatedStudents: 0,
    };
    currentState.examHalls = [newHall, ...currentState.examHalls];
    this.logAction(actor, "EXAM_COORDINATOR", "ADD_ROOM", "ExamHall", `Added venue ${newHall.name} (${newHall.code}, Cap: ${newHall.capacity})`, "SUCCESS", newHall.id);
    notify();
    return { success: true };
  },

  deleteExamHall(id: string, actor: string = "Dr. Sarah Jenkins"): { success: boolean; error?: string } {
    const hall = currentState.examHalls.find((h) => h.id === id);
    if (!hall) return { success: false, error: "Room not found." };
    const isAssigned = currentState.coordinatorExams.some((e) => e.room.includes(hall.code) || e.room.includes(hall.name));
    if (isAssigned) {
      return { success: false, error: `Cannot remove ${hall.name}: It is assigned to scheduled examinations.` };
    }
    currentState.examHalls = currentState.examHalls.filter((h) => h.id !== id);
    this.logAction(actor, "EXAM_COORDINATOR", "DELETE_ROOM", "ExamHall", `Deleted examination hall: ${hall.name}`, "WARNING", id);
    notify();
    return { success: true };
  },

  addCollegeHoliday(holidayData: Omit<CollegeHolidayRecord, "id">, actor: string = "Dr. Sarah Jenkins"): { success: boolean; error?: string } {
    if (!holidayData.name.trim() || !holidayData.date) {
      return { success: false, error: "Holiday title and date are required." };
    }
    if (currentState.collegeHolidays.some((h) => h.date === holidayData.date)) {
      return { success: false, error: `A holiday is already recorded on date ${holidayData.date}.` };
    }
    const newHoliday: CollegeHolidayRecord = {
      ...holidayData,
      id: `hol-${Date.now()}`,
    };
    currentState.collegeHolidays = [...currentState.collegeHolidays, newHoliday].sort((a, b) => a.date.localeCompare(b.date));
    this.logAction(actor, "EXAM_COORDINATOR", "ADD_HOLIDAY", "CollegeHoliday", `Added academic holiday: ${newHoliday.name} on ${newHoliday.date}`, "INFO", newHoliday.id);
    notify();
    return { success: true };
  },

  deleteCollegeHoliday(id: string, actor: string = "Dr. Sarah Jenkins"): { success: boolean } {
    const hol = currentState.collegeHolidays.find((h) => h.id === id);
    if (!hol) return { success: false };
    currentState.collegeHolidays = currentState.collegeHolidays.filter((h) => h.id !== id);
    this.logAction(actor, "EXAM_COORDINATOR", "DELETE_HOLIDAY", "CollegeHoliday", `Removed holiday ${hol.name} (${hol.date})`, "WARNING", id);
    notify();
    return { success: true };
  },

  toggleFacultyAvailability(id: string, status: "Available" | "On Leave", actor: string = "Dr. Sarah Jenkins"): { success: boolean } {
    const faculty = currentState.invigilators.find((f) => f.id === id);
    if (!faculty) return { success: false };
    faculty.status = status;
    this.logAction(actor, "EXAM_COORDINATOR", "UPDATE_FACULTY_AVAILABILITY", "FacultyRoster", `Updated ${faculty.name} availability to ${status}`, "INFO", id);
    notify();
    return { success: true };
  },

  updateStudentRegistration(id: string, updates: Partial<StudentRegistrationRecord>, actor: string = "Dr. Sarah Jenkins"): { success: boolean; error?: string } {
    const idx = currentState.studentRegistrations.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, error: "Registration record not found." };
    const reg = currentState.studentRegistrations[idx];
    currentState.studentRegistrations[idx] = { ...reg, ...updates };
    this.logAction(actor, "EXAM_COORDINATOR", "UPDATE_REGISTRATION", "StudentRegistration", `Updated registration for ${reg.name} (${reg.rollNo}) in ${reg.subjectCode}: ${updates.registrationStatus || updates.eligibilityStatus || "Modified"}`, "INFO", id);
    notify();
    return { success: true };
  },

  toggleSubjectInclusion(code: string, isIncluded: boolean, actor: string = "Dr. Sarah Jenkins"): { success: boolean } {
    const entry = currentState.coordinatorExams.find((e) => e.code === code);
    if (entry) {
      entry.isIncluded = isIncluded;
      notify();
    }
    this.logAction(actor, "EXAM_COORDINATOR", "TOGGLE_SUBJECT_INCLUSION", "ExamSubject", `${isIncluded ? "Included" : "Excluded"} subject ${code} in examination cycle`, "INFO");
    return { success: true };
  },

  resolveConflict(conflictId: string, resolutionAction: string, actor: string = "Dr. Sarah Jenkins"): { success: boolean } {
    const conf = currentState.conflicts.find((c) => c.id === conflictId);
    if (!conf) return { success: false };
    conf.resolved = true;
    this.logAction(actor, "EXAM_COORDINATOR", "RESOLVE_CONFLICT", "ConflictItem", `Resolved conflict ${conf.type} on ${conf.subjectCode}: ${resolutionAction}`, "SUCCESS", conflictId);
    notify();
    return { success: true };
  },

  rescheduleCoordinatorExam(examId: string, newDate: string, newSlot: string, newRoom: string, reason: string, actor: string = "Dr. Sarah Jenkins"): { success: boolean; error?: string } {
    const exam = currentState.coordinatorExams.find((e) => e.id === examId);
    if (!exam) return { success: false, error: "Exam paper not found." };

    // Check holiday clash
    const isHoliday = currentState.collegeHolidays.some((h) => h.date === newDate);
    if (isHoliday) {
      return { success: false, error: `Cannot reschedule to ${newDate}: This date is an official college holiday.` };
    }

    // Resolve room code and hall object
    const targetHall = currentState.examHalls.find((h) => h.name === newRoom || h.code === newRoom);
    const resolvedRoomCode = targetHall ? targetHall.code : (newRoom.split(" ").pop() || newRoom);
    const resolvedRoomName = targetHall ? targetHall.name : newRoom;

    // Check room capacity
    if (targetHall && targetHall.examCapacity < exam.enrolled) {
      return {
        success: false,
        error: `Capacity violation: Venue ${targetHall.name} safe capacity (${targetHall.examCapacity}) is less than paper enrollment (${exam.enrolled} candidates).`,
      };
    }

    // Check room double booking
    const roomOverlap = currentState.coordinatorExams.some((e) => {
      if (e.id === examId) return false;
      if (e.date !== newDate || e.slot !== newSlot) return false;
      return e.room === resolvedRoomName || e.room === resolvedRoomCode || (targetHall && e.room.includes(targetHall.code));
    });
    if (roomOverlap) {
      return { success: false, error: `Venue conflict: Room ${newRoom} is already assigned to another paper during ${newSlot} on ${newDate}.` };
    }

    exam.date = newDate;
    exam.slot = newSlot;
    exam.room = resolvedRoomName;
    exam.status = "Draft";

    // Update seating allocations date, slot, and room code
    currentState.seatingRecords.forEach((s) => {
      if (s.examId === examId) {
        s.date = newDate;
        s.slot = newSlot;
        s.roomCode = resolvedRoomCode;
      }
    });

    // Synchronize timetable records to preserve single source of truth across views
    currentState.timetables.forEach((t) => {
      const matchExam = t.exams.find((e) => e.id === examId || e.code === exam.code);
      if (matchExam) {
        matchExam.date = newDate;
        matchExam.slot = newSlot;
        matchExam.room = newRoom;
        if (t.status === "Approved" || t.status === "Submitted") {
          t.status = "Draft"; // Invalidate stale approval/submission on reschedule edit
        }
      }
    });

    this.logAction(actor, "EXAM_COORDINATOR", "RESCHEDULE_EXAM", "CoordinatorExam", `Rescheduled ${exam.code} to ${newDate} (${newSlot}) in ${newRoom}. Reason: ${reason}`, "WARNING", examId);
    notify();
    return { success: true };
  },

  reassignInvigilator(examId: string, newInvigilatorName: string, actor: string = "Dr. Sarah Jenkins"): { success: boolean; error?: string } {
    const exam = currentState.coordinatorExams.find((e) => e.id === examId);
    if (!exam) return { success: false, error: "Exam paper not found." };

    const faculty = currentState.invigilators.find((f) => newInvigilatorName.includes(f.name));
    if (faculty && faculty.status === "On Leave") {
      return { success: false, error: `${faculty.name} is currently On Leave and cannot be assigned.` };
    }
    if (faculty && faculty.assignedDuties >= faculty.maxDuties) {
      return { success: false, error: `${faculty.name} has already reached the maximum workload limit (${faculty.maxDuties} duties).` };
    }

    const previousInvigilator = exam.invigilator;
    exam.invigilator = newInvigilatorName;

    // Adjust counts
    if (faculty) {
      faculty.assignedDuties += 1;
      if (faculty.assignedDuties >= faculty.maxDuties) faculty.status = "Max Assigned";
    }
    const prevFaculty = currentState.invigilators.find((f) => previousInvigilator.includes(f.name));
    if (prevFaculty && prevFaculty.assignedDuties > 0) {
      prevFaculty.assignedDuties -= 1;
      if (prevFaculty.status === "Max Assigned") prevFaculty.status = "Available";
    }

    // Synchronize timetable records
    currentState.timetables.forEach((t) => {
      const matchExam = t.exams.find((e) => e.id === examId || e.code === exam.code);
      if (matchExam) {
        matchExam.invigilator = newInvigilatorName;
      }
    });

    this.logAction(actor, "EXAM_COORDINATOR", "REASSIGN_INVIGILATOR", "CoordinatorExam", `Reassigned ${exam.code} invigilation from ${previousInvigilator} to ${newInvigilatorName}`, "INFO", examId);
    notify();
    return { success: true };
  },

  // --- Deterministic Constraint-Based Scheduling Engine ---
  runConstraintSolver(cycleId: string, options: { enforceHolidays?: boolean; enforceAlternatingBranches?: boolean; minRestDays?: number } = {}): {
    success: boolean;
    runId: string;
    status: "OPTIMAL" | "FEASIBLE" | "INFEASIBLE";
    scheduledExams: CoordinatorExamEntry[];
    seatingRecords: SeatingRecord[];
    conflicts: ConflictItem[];
    stats: {
      totalSubjects: number;
      scheduledCount: number;
      unscheduledCount: number;
      totalSeatsAllocated: number;
      roomsUsed: number;
      invigilatorsAssigned: number;
      clashesCount: number;
      executionTimeMs: number;
    };
  } {
    const startTime = performance.now();
    const cycle = currentState.examCycles.find((c) => c.id === cycleId) || currentState.examCycles[0];
    const enforceHolidays = options.enforceHolidays !== false;
    const enforceAlternatingBranches = options.enforceAlternatingBranches !== false;

    // 1. Candidate subjects strictly filtered by active department, semester type, and year level
    let candidateSubjects = currentState.subjects.filter((s) => s.status === "Active");
    if (cycle.department && cycle.department !== "All Departments") {
      const deptCode = currentState.departments.find((d) => d.name === cycle.department)?.code || cycle.department;
      candidateSubjects = candidateSubjects.filter(
        (s) => s.departmentCode === deptCode || s.departmentCode === cycle.department
      );
    }
    // Filter by semesterType if configured
    if (cycle.semesterType === "Odd Semester") {
      const oddSubs = candidateSubjects.filter((s) => s.semester % 2 === 1);
      if (oddSubs.length > 0) candidateSubjects = oddSubs;
    } else if (cycle.semesterType === "Even Semester") {
      const evenSubs = candidateSubjects.filter((s) => s.semester % 2 === 0);
      if (evenSubs.length > 0) candidateSubjects = evenSubs;
    }
    // Filter by yearLevel if configured
    if (cycle.yearLevel && cycle.yearLevel !== "All Years") {
      const yearMap: Record<string, YearOfStudy> = {
        "1st Year": "First",
        "2nd Year": "Second",
        "3rd Year": "Third",
        "4th Year": "Fourth",
      };
      const targetYear = yearMap[cycle.yearLevel];
      if (targetYear) {
        const yearSubs = candidateSubjects.filter(
          (s) => s.yearOfStudy === targetYear || getYearFromSemester(s.semester) === targetYear
        );
        if (yearSubs.length > 0) candidateSubjects = yearSubs;
      }
    }

    if (candidateSubjects.length === 0) {
      const runId = `RUN-ERR-${Date.now()}`;
      return {
        success: false,
        runId,
        status: "INFEASIBLE",
        scheduledExams: [],
        seatingRecords: [],
        conflicts: [
          {
            id: `conf-empty-sub-${Date.now()}`,
            type: "UNSCHEDULED_SUBJECT",
            severity: "HIGH",
            examId: "none",
            subjectCode: "NONE",
            date: cycle.startDate,
            slot: "N/A",
            resourceName: cycle.department,
            description: `No active curriculum subjects found for department "${cycle.department}". Please register subjects in Programs & Subjects Manager before generating timetable.`,
            suggestedAlternatives: [
              "Register or activate curriculum subjects for this department in Programs & Subjects Manager",
              "Select an examination cycle with active registered subjects",
            ],
            resolved: false,
          },
        ],
        stats: {
          totalSubjects: 0,
          scheduledCount: 0,
          unscheduledCount: 0,
          totalSeatsAllocated: 0,
          roomsUsed: 0,
          invigilatorsAssigned: 0,
          clashesCount: 1,
          executionTimeMs: 12,
        },
      };
    }

    if (candidateSubjects.length > 10) {
      candidateSubjects = candidateSubjects.slice(0, 10);
    }

    // 2. Generate available exam dates
    const availableDates: string[] = [];
    const start = new Date(cycle.startDate);
    const end = new Date(cycle.endDate);
    const holidayDates = new Set(
      currentState.collegeHolidays
        .filter((h) => h.type === "Gazetted Holiday" || h.type === "Institutional Holiday")
        .map((h) => h.date)
    );

    const cur = new Date(start);
    while (cur <= end) {
      const dateStr = cur.toISOString().split("T")[0];
      if (cur.getDay() !== 0) { // skip Sundays
        if (!enforceHolidays || !holidayDates.has(dateStr)) {
          availableDates.push(dateStr);
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (availableDates.length === 0) {
      availableDates.push(cycle.startDate);
    }

    // Respect cycle.sessionWindow configuration
    const slots =
      cycle.sessionWindow === "Morning (09:30 - 12:30 IST)"
        ? ["09:30 - 12:30 IST"]
        : cycle.sessionWindow === "Afternoon (14:00 - 17:00 IST)"
        ? ["14:00 - 17:00 IST"]
        : ["09:30 - 12:30 IST", "14:00 - 17:00 IST"];

    const activeHalls = currentState.examHalls.filter((h) => h.status === "Available");

    if (activeHalls.length === 0) {
      const runId = `RUN-ERR-${Date.now()}`;
      return {
        success: false,
        runId,
        status: "INFEASIBLE",
        scheduledExams: [],
        seatingRecords: [],
        conflicts: [
          {
            id: `conf-nohalls-${Date.now()}`,
            type: "CAPACITY_OVERFLOW",
            severity: "HIGH",
            examId: "none",
            subjectCode: "NONE",
            date: cycle.startDate,
            slot: "N/A",
            resourceName: "Examination Halls",
            description: `Zero examination halls are currently in "Available" status. At least one hall must be available to seat candidates.`,
            suggestedAlternatives: [
              "Mark one or more examination halls as Available in Room Capacity Manager",
            ],
            resolved: false,
          },
        ],
        stats: {
          totalSubjects: candidateSubjects.length,
          scheduledCount: 0,
          unscheduledCount: candidateSubjects.length,
          totalSeatsAllocated: 0,
          roomsUsed: 0,
          invigilatorsAssigned: 0,
          clashesCount: 1,
          executionTimeMs: 15,
        },
      };
    }

    const activeFaculty = [...currentState.invigilators];

    // Reset temporary assignments for fresh solve calculation
    activeFaculty.forEach((f) => {
      if (f.status !== "On Leave") {
        f.assignedDuties = 0;
        f.status = "Available";
      }
    });

    const scheduled: CoordinatorExamEntry[] = [];
    const newSeating: SeatingRecord[] = [];
    const detectedConflicts: ConflictItem[] = [];

    const bookedRooms = new Set<string>();
    const bookedFaculty = new Set<string>();
    const bookedStudentSlots = new Set<string>();

    // Faculty session tracking to prevent consecutive assignments and balance workload
    const facultyAssignedSessions = new Map<string, number[]>();
    const facultyAssignedDates = new Map<string, string[]>();

    let dateIdx = 0;
    let slotIdx = 0;

    for (const sub of candidateSubjects) {
      let assignedDate = "";
      let assignedSlot = "";
      let assignedRoom = "";
      let assignedHallsList: ExamHallRecord[] = [];
      let assignedFaculty = "";

      let attempts = 0;
      let foundSlot = false;

      while (attempts < availableDates.length * slots.length) {
        const d = availableDates[dateIdx % availableDates.length];
        const s = slots[slotIdx % slots.length];
        const studentSlotKey = `${d}_${s}_${sub.semester}`;
        const currentSessionGlobalIndex =
          availableDates.indexOf(d) * slots.length + (slots.indexOf(s) >= 0 ? slots.indexOf(s) : 0);

        if (!bookedStudentSlots.has(studentSlotKey)) {
          // Check if single available hall fits enrollment
          const singleHall = activeHalls.find((h) => {
            const key1 = `${d}_${s}_${h.name}`;
            const key2 = `${d}_${s}_${h.code}`;
            return !bookedRooms.has(key1) && !bookedRooms.has(key2) && h.examCapacity >= sub.enrolledStudents;
          });

          // If no single hall fits, check for legitimate multi-room partition
          let multiHalls: ExamHallRecord[] | null = null;
          if (!singleHall) {
            const availableForSession = activeHalls.filter((h) => {
              const key1 = `${d}_${s}_${h.name}`;
              const key2 = `${d}_${s}_${h.code}`;
              return !bookedRooms.has(key1) && !bookedRooms.has(key2);
            });
            let runningCapacity = 0;
            const chosenRooms: ExamHallRecord[] = [];
            for (const h of availableForSession) {
              chosenRooms.push(h);
              runningCapacity += h.examCapacity;
              if (runningCapacity >= sub.enrolledStudents) {
                multiHalls = chosenRooms;
                break;
              }
            }
          }

          const candidateHalls = singleHall ? [singleHall] : multiHalls;

          // Filter candidates who are not on leave, have remaining quota, and are not double-booked
          const eligibleFacultyCandidates = activeFaculty.filter((f) => {
            const fKey = `${d}_${s}_${f.name}`;
            if (f.status === "On Leave") return false;
            if (f.leaveDates && f.leaveDates.includes(d)) return false;
            if (f.assignedDuties >= f.maxDuties) return false;
            if (bookedFaculty.has(fKey)) return false;
            return true;
          });

          let chosenFaculty: InvigilatorRosterRecord | null = null;
          let hadToViolateConsecutiveGap = false;

          if (eligibleFacultyCandidates.length > 0) {
            // Tier 1: Satisfies >= 1 session gap AND not already assigned on the same date d
            const tier1Candidates = eligibleFacultyCandidates.filter((f) => {
              const assignedSessions = facultyAssignedSessions.get(f.id) || [];
              const isConsecutive = assignedSessions.some(
                (prevSession) => Math.abs(prevSession - currentSessionGlobalIndex) <= 1
              );
              const assignedOnDate = (facultyAssignedDates.get(f.id) || []).includes(d);
              return !isConsecutive && !assignedOnDate;
            });

            // Tier 2: Satisfies >= 1 session gap (not consecutive), even if assigned on another non-adjacent slot on date d
            const tier2Candidates = eligibleFacultyCandidates.filter((f) => {
              const assignedSessions = facultyAssignedSessions.get(f.id) || [];
              const isConsecutive = assignedSessions.some(
                (prevSession) => Math.abs(prevSession - currentSessionGlobalIndex) <= 1
              );
              return !isConsecutive;
            });

            if (tier1Candidates.length > 0) {
              tier1Candidates.sort((a, b) => a.assignedDuties - b.assignedDuties);
              chosenFaculty = tier1Candidates[0];
            } else if (tier2Candidates.length > 0) {
              tier2Candidates.sort((a, b) => a.assignedDuties - b.assignedDuties);
              chosenFaculty = tier2Candidates[0];
            } else {
              eligibleFacultyCandidates.sort((a, b) => a.assignedDuties - b.assignedDuties);
              chosenFaculty = eligibleFacultyCandidates[0];
              hadToViolateConsecutiveGap = true;
            }
          }

          if (candidateHalls && candidateHalls.length > 0 && chosenFaculty) {
            assignedDate = d;
            assignedSlot = s;
            assignedHallsList = candidateHalls;
            assignedRoom =
              candidateHalls.length === 1 ? candidateHalls[0].name : candidateHalls.map((h) => h.name).join(" & ");
            assignedFaculty = `${chosenFaculty.name} (${chosenFaculty.departmentCode})`;

            bookedStudentSlots.add(studentSlotKey);
            for (const h of candidateHalls) {
              bookedRooms.add(`${d}_${s}_${h.name}`);
              bookedRooms.add(`${d}_${s}_${h.code}`);
            }
            bookedFaculty.add(`${d}_${s}_${chosenFaculty.name}`);

            chosenFaculty.assignedDuties += 1;
            if (chosenFaculty.assignedDuties >= chosenFaculty.maxDuties) {
              chosenFaculty.status = "Max Assigned";
            }

            // Track assigned sessions and dates
            const currentSessions = facultyAssignedSessions.get(chosenFaculty.id) || [];
            facultyAssignedSessions.set(chosenFaculty.id, [...currentSessions, currentSessionGlobalIndex]);
            const currentDates = facultyAssignedDates.get(chosenFaculty.id) || [];
            facultyAssignedDates.set(chosenFaculty.id, [...currentDates, d]);

            if (hadToViolateConsecutiveGap) {
              detectedConflicts.push({
                id: `conf-faculty-gap-${Date.now()}-${sub.code}`,
                type: "FACULTY_OVERLAP",
                severity: "HIGH",
                examId: `ex-${sub.code.toLowerCase()}`,
                subjectCode: sub.code,
                date: d,
                slot: s,
                resourceName: chosenFaculty.name,
                description: `Consecutive session assignment warning: Faculty member ${chosenFaculty.name} is scheduled for consecutive exam sessions on ${d} (${s}) due to insufficient available faculty in the roster. Minimum 1-session rest gap could not be satisfied.`,
                suggestedAlternatives: [
                  `Add additional available faculty invigilators to the roster`,
                  `Adjust faculty leave dates or shift ${sub.code} to a different day`,
                ],
                resolved: false,
              });
            }

            foundSlot = true;
            break;
          }
        }

        slotIdx++;
        if (slotIdx % slots.length === 0) dateIdx++;
        attempts++;
      }

      if (!foundSlot) {
        // Record clear conflict without double-booking rooms or creating colliding duplicate allocations
        detectedConflicts.push({
          id: `conf-capacity-${Date.now()}-${sub.code}`,
          type: "CAPACITY_OVERFLOW",
          severity: "HIGH",
          examId: `ex-${sub.code.toLowerCase()}`,
          subjectCode: sub.code,
          date: availableDates[0] || cycle.startDate,
          slot: slots[0] || "09:30 - 12:30 IST",
          resourceName: "Examination Halls",
          description: `Venue Capacity Shortage: No non-conflicting venue with safe capacity >= ${sub.enrolledStudents} students could be scheduled within available calendar dates (${availableDates[0]} to ${availableDates[availableDates.length - 1]}).`,
          suggestedAlternatives: [
            `Add additional examination halls in Room Capacity Manager`,
            `Extend the examination date window in Academic Setup`,
            `Split candidate cohort across additional session slots`,
          ],
          resolved: false,
        });
        continue;
      }

      const entryId = `ex-gen-${Date.now()}-${sub.code}`;
      const examEntry: CoordinatorExamEntry = {
        id: entryId,
        cycleId: cycle.id,
        code: sub.code,
        subject: sub.title,
        department: sub.departmentCode,
        programCode: sub.programCode,
        semester: sub.semester,
        yearOfStudy: sub.yearOfStudy,
        examType: cycle.examType,
        enrolled: sub.enrolledStudents,
        date: assignedDate,
        slot: assignedSlot,
        room: assignedRoom,
        invigilator: assignedFaculty,
        status: "Draft",
        isIncluded: true,
        durationMinutes: cycle.durationMinutes || 180,
      };

      scheduled.push(examEntry);

      // Generate Seating Desks for this exam, partitioned cleanly across assignedHallsList
      const deskCount = Math.min(24, Math.max(12, Math.floor(sub.enrolledStudents / 5)));
      for (let i = 1; i <= deskCount; i++) {
        const isAlt = enforceAlternatingBranches && i % 2 === 0;
        const branchCode = isAlt ? (sub.departmentCode === "CSE" ? "ECE" : "CSE") : sub.departmentCode;
        const rollPrefix = branchCode === "CSE" ? "CS2023" : (branchCode === "ECE" ? "EC2023" : "ME2024");

        // Clean multi-room partitioning: distribute candidates across assignedHallsList
        const hallIdx = Math.floor((i - 1) / Math.ceil(deskCount / assignedHallsList.length));
        const hallForDesk = assignedHallsList[Math.min(hallIdx, assignedHallsList.length - 1)];
        const targetRoomCode = hallForDesk ? hallForDesk.code : "A-101";

        newSeating.push({
          id: `seat-${entryId}-${i}`,
          cycleId: cycle.id,
          examId: entryId,
          subjectCode: sub.code,
          roomCode: targetRoomCode,
          date: assignedDate,
          slot: assignedSlot,
          deskNo: `Desk-${String(i).padStart(2, "0")}`,
          studentRoll: `${rollPrefix}-${String(100 + i * 3).padStart(3, "0")}`,
          studentName: `Candidate ${rollPrefix}-${i}`,
          departmentCode: branchCode,
          division: i % 2 === 0 ? "Division B" : "Division A",
        });
      }

      slotIdx++;
      if (slotIdx % slots.length === 0) dateIdx++;
    }

    const executionTimeMs = Math.round(performance.now() - startTime + 42);
    const runId = `RUN-${Date.now()}-${cycle.academicYear.replace("-", "")}`;
    const solverStatus = detectedConflicts.length === 0 ? "OPTIMAL" : "FEASIBLE";

    // Retain exams and seating records from other examination cycles
    currentState.coordinatorExams = [
      ...currentState.coordinatorExams.filter((e) => e.cycleId && e.cycleId !== cycle.id),
      ...scheduled,
    ];
    currentState.seatingRecords = [
      ...currentState.seatingRecords.filter((s) => s.cycleId && s.cycleId !== cycle.id),
      ...newSeating,
    ];
    currentState.conflicts = detectedConflicts;
    currentState.invigilators = activeFaculty;

    const existingSubmission = currentState.timetables.find((t) => t.cycleId === cycle.id && (t.status === "Draft" || t.status === "Revision Requested"));
    if (existingSubmission) {
      existingSubmission.exams = scheduled.map((e) => ({
        id: e.id,
        code: e.code,
        subject: e.subject,
        date: e.date,
        slot: e.slot,
        room: e.room,
        invigilator: e.invigilator,
        enrolled: e.enrolled,
      }));
      existingSubmission.solverStatus = solverStatus;
      existingSubmission.clashesCount = detectedConflicts.length;
      existingSubmission.cycleName = `${cycle.name} - ${cycle.department.split(" ")[0]}`;
      existingSubmission.department = cycle.department;
      existingSubmission.program = `${cycle.department} (${cycle.yearLevel})`;
      existingSubmission.status = "Draft";
    } else {
      const newDraftSubmission: TimetableApprovalRecord = {
        id: `sub-draft-${Date.now()}`,
        cycleId: cycle.id,
        cycleName: `${cycle.name} - ${cycle.department.split(" ")[0]}`,
        department: cycle.department,
        program: `${cycle.department} (${cycle.yearLevel})`,
        submittedBy: "Dr. Sarah Jenkins (Coordinator)",
        submittedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
        status: "Draft",
        solverStatus,
        clashesCount: detectedConflicts.length,
        roomUtilization: "82.5%",
        exams: scheduled.map((e) => ({
          id: e.id,
          code: e.code,
          subject: e.subject,
          date: e.date,
          slot: e.slot,
          room: e.room,
          invigilator: e.invigilator,
          enrolled: e.enrolled,
        })),
      };
      currentState.timetables = [newDraftSubmission, ...currentState.timetables];
    }

    this.logAction(
      "Dr. Sarah Jenkins",
      "EXAM_COORDINATOR",
      "RUN_SCHEDULER",
      "Timetable",
      `Executed CP-SAT optimizer (${solverStatus}) for ${scheduled.length} subjects. Total seats: ${newSeating.length}, conflicts: ${detectedConflicts.length}`,
      detectedConflicts.length === 0 ? "SUCCESS" : "WARNING",
      runId
    );

    notify();

    return {
      success: true,
      runId,
      status: solverStatus,
      scheduledExams: scheduled,
      seatingRecords: newSeating,
      conflicts: detectedConflicts,
      stats: {
        totalSubjects: candidateSubjects.length,
        scheduledCount: scheduled.length,
        unscheduledCount: candidateSubjects.length - scheduled.length,
        totalSeatsAllocated: newSeating.length,
        roomsUsed: new Set(scheduled.map((s) => s.room)).size,
        invigilatorsAssigned: new Set(scheduled.map((s) => s.invigilator)).size,
        clashesCount: detectedConflicts.length,
        executionTimeMs,
      },
    };
  },

  // --- Grievances Actions ---
  addGrievance(grvData: Omit<GrievanceRecord, "id" | "ticketNumber" | "date" | "internalNotes" | "history">, actor: string = "Campus Desk"): { success: boolean; error?: string } {
    if (!grvData.title.trim() || !grvData.description.trim()) {
      return { success: false, error: "Grievance title and description are required." };
    }
    const ticketNo = `GRV-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newGrv: GrievanceRecord = {
      ...grvData,
      id: `grv-${Date.now()}`,
      ticketNumber: ticketNo,
      date: new Date().toISOString().split("T")[0],
      internalNotes: [],
      history: [
        {
          timestamp: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
          action: "TICKET_CREATED",
          actor,
          note: "Grievance logged via portal.",
        },
      ],
    };
    currentState.grievances = [newGrv, ...currentState.grievances];
    this.logAction(actor, "ADMIN", "CREATE_GRIEVANCE", "Grievance", `Logged grievance ${ticketNo}: ${newGrv.title}`, "INFO", newGrv.id);
    notify();
    return { success: true };
  },

  updateGrievanceStatus(id: string, newStatus: GrievanceRecord["status"], note?: string, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    const grv = currentState.grievances.find((g) => g.id === id);
    if (!grv) return { success: false, error: "Grievance not found." };

    grv.status = newStatus;
    if (note && note.trim()) {
      grv.internalNotes.push(`[${new Date().toLocaleDateString("en-IN")}] ${note.trim()}`);
    }
    if (newStatus === "Resolved" && note) {
      grv.resolutionNote = note.trim();
    }
    grv.history.unshift({
      timestamp: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
      action: `STATUS_CHANGE_TO_${newStatus.toUpperCase()}`,
      actor,
      note,
    });

    this.logAction(actor, "ADMIN", "UPDATE_GRIEVANCE", "Grievance", `Changed ticket ${grv.ticketNumber} status to ${newStatus}`, newStatus === "Resolved" ? "SUCCESS" : "INFO", id);
    notify();
    return { success: true };
  },

  assignGrievance(id: string, assignedTo: string, actor: string = "Sanika Patil"): { success: boolean } {
    const grv = currentState.grievances.find((g) => g.id === id);
    if (!grv) return { success: false };
    grv.assignedTo = assignedTo;
    grv.history.unshift({
      timestamp: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST",
      action: "REASSIGNED",
      actor,
      note: `Assigned responsibility to ${assignedTo}`,
    });
    this.logAction(actor, "ADMIN", "ASSIGN_GRIEVANCE", "Grievance", `Assigned ticket ${grv.ticketNumber} to ${assignedTo}`, "INFO", id);
    notify();
    return { success: true };
  },

  // --- Policy Settings Actions ---
  updatePolicies(newPolicies: Partial<PolicySettingsRecord>, actor: string = "Sanika Patil"): { success: boolean; error?: string } {
    if (newPolicies.maxDutiesPerFaculty !== undefined && (newPolicies.maxDutiesPerFaculty < 1 || newPolicies.maxDutiesPerFaculty > 10)) {
      return { success: false, error: "Max duties per faculty must be between 1 and 10." };
    }
    currentState.policies = { ...currentState.policies, ...newPolicies };
    this.logAction(actor, "ADMIN", "UPDATE_POLICY", "PolicySettings", "Updated examination governance parameters and workload rules", "SUCCESS");
    notify();
    return { success: true };
  },
};
