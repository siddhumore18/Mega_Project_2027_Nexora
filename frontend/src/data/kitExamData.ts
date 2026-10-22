import type {
  SubjectRecord,
  ExamCycleRecord,
  CoordinatorExamEntry,
  DepartmentRecord,
  ProgramRecord,
} from "../services/academicDataStore.js";

// =========================================================================
// 1. INSTITUTIONAL DEPARTMENTS & PROGRAMMES (KIT's College of Engineering)
// =========================================================================
export const KIT_DEPARTMENTS: DepartmentRecord[] = [
  { id: "dept-cse", code: "CSE", name: "Computer Science & Engineering", hodName: "Prof. R. K. Mehta", studentStrength: 540, programsCount: 2, facultyCount: 28, createdAt: "2026-01-10" },
  { id: "dept-cvl", code: "CVL", name: "Civil Engineering", hodName: "Dr. S. Nair", studentStrength: 320, programsCount: 2, facultyCount: 18, createdAt: "2026-01-10" },
  { id: "dept-bio", code: "BIO", name: "Biotechnology", hodName: "Dr. Anjali Patil", studentStrength: 210, programsCount: 1, facultyCount: 12, createdAt: "2026-01-10" },
  { id: "dept-mech", code: "MECH", name: "Mechanical Engineering", hodName: "Dr. Pramod Kulkarni", studentStrength: 380, programsCount: 2, facultyCount: 22, createdAt: "2026-01-10" },
  { id: "dept-etc", code: "ETC", name: "Electronics & Telecommunication", hodName: "Dr. M. Roy", studentStrength: 350, programsCount: 2, facultyCount: 20, createdAt: "2026-01-10" },
  { id: "dept-cve", code: "CVL & ENV", name: "Civil and Environmental Engineering", hodName: "Dr. R. V. Kulkarni", studentStrength: 240, programsCount: 1, facultyCount: 14, createdAt: "2026-01-10" },
  { id: "dept-ele", code: "ELE", name: "Electrical Engineering", hodName: "Dr. A. Verma", studentStrength: 280, programsCount: 2, facultyCount: 16, createdAt: "2026-01-10" },
  { id: "dept-aiml", code: "CSEAIML", name: "CSE (Artificial Intelligence & Machine Learning)", hodName: "Dr. T. Banerjee", studentStrength: 240, programsCount: 1, facultyCount: 14, createdAt: "2026-01-10" },
  { id: "dept-ds", code: "CSEDS", name: "CSE (Data Science)", hodName: "Dr. Vikram Joshi", studentStrength: 240, programsCount: 1, facultyCount: 14, createdAt: "2026-01-10" },
  { id: "dept-csbs", code: "CSBS", name: "Computer Science & Business Systems", hodName: "Dr. Suresh Kulkarni", studentStrength: 220, programsCount: 1, facultyCount: 12, createdAt: "2026-01-10" },
];

export const KIT_PROGRAMS: ProgramRecord[] = [
  { id: "prog-cse", code: "BTECH-CSE", name: "B.Tech in Computer Science & Engineering", degreeLevel: "Undergraduate", departmentCode: "CSE", durationYears: 4, currentStrength: 480 },
  { id: "prog-cvl", code: "BTECH-CVL", name: "B.Tech in Civil Engineering", degreeLevel: "Undergraduate", departmentCode: "CVL", durationYears: 4, currentStrength: 300 },
  { id: "prog-bio", code: "BTECH-BIO", name: "B.Tech in Biotechnology", degreeLevel: "Undergraduate", departmentCode: "BIO", durationYears: 4, currentStrength: 200 },
  { id: "prog-mech", code: "BTECH-MECH", name: "B.Tech in Mechanical Engineering", degreeLevel: "Undergraduate", departmentCode: "MECH", durationYears: 4, currentStrength: 360 },
  { id: "prog-etc", code: "BTECH-ETC", name: "B.Tech in Electronics & Telecommunication", degreeLevel: "Undergraduate", departmentCode: "ETC", durationYears: 4, currentStrength: 320 },
  { id: "prog-cve", code: "BTECH-CVL_ENV", name: "B.Tech in Civil & Environmental Engineering", degreeLevel: "Undergraduate", departmentCode: "CVL & ENV", durationYears: 4, currentStrength: 220 },
  { id: "prog-ele", code: "BTECH-ELE", name: "B.Tech in Electrical Engineering", degreeLevel: "Undergraduate", departmentCode: "ELE", durationYears: 4, currentStrength: 260 },
  { id: "prog-aiml", code: "BTECH-CSEAIML", name: "B.Tech in CSE (AI & ML)", degreeLevel: "Undergraduate", departmentCode: "CSEAIML", durationYears: 4, currentStrength: 240 },
  { id: "prog-ds", code: "BTECH-CSEDS", name: "B.Tech in CSE (Data Science)", degreeLevel: "Undergraduate", departmentCode: "CSEDS", durationYears: 4, currentStrength: 240 },
  { id: "prog-csbs", code: "BTECH-CSBS", name: "B.Tech in Computer Science & Business Systems", degreeLevel: "Undergraduate", departmentCode: "CSBS", durationYears: 4, currentStrength: 220 },
];

// =========================================================================
// 2. EXAM CYCLE: ESE 2026 (22 November 2026 to 04 December 2026)
// =========================================================================
export const KIT_ESE_2026_EXAM_CYCLE: ExamCycleRecord = {
  id: "cycle-ese-2026",
  name: "End Semester Examination (ESE 2026)",
  academicYear: "2026-27",
  semesterType: "Odd Semester",
  examType: "ESE",
  department: "All Departments",
  yearLevel: "All Years",
  division: "All Divisions",
  startDate: "2026-11-22",
  endDate: "2026-12-04",
  registrationDeadline: "2026-11-15",
  sessionWindow: "Three Sessions (Morning, Afternoon, Evening)",
  durationMinutes: 150,
  status: "In Progress",
  applicableSubjectsCount: 166,
  createdAt: "2026-10-22",
};

// =========================================================================
// 3. MASTER CURRICULUM SUBJECTS EXTRACTED FROM OFFICIAL INSTITUTION PDF
// =========================================================================
export const KIT_ESE_2026_SUBJECTS: SubjectRecord[] = [
  // --- S.Y. B.Tech (Sem III) ---
  // Paper 1
  { id: "sub-sy-cvl-1", code: "UCVPC0301", title: "Mathematics and Numerical Analysis", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-sy-cse-1", code: "UCSPC0301", title: "Discrete Mathematical Structures", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-sy-bio-1", code: "UBTPC0301", title: "Fluid Mechanics", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 55, curriculumStructure: "NEP" },
  { id: "sub-sy-mech-1", code: "UMEPC0301", title: "Mathematics for Mechanical Engineering", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-sy-etc-1", code: "UETPC0301", title: "Analog Circuits", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-sy-cve-1", code: "UCEPC0301", title: "Computational Methods and Numerical Analysis", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-sy-ele-1", code: "UELPC0301", title: "DC Machines & Transformers", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-sy-aiml-1", code: "UAMPC0301", title: "Linear Algebra", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-sy-csbs-1", code: "UCBPC0301", title: "Formal Language and Automata Theory", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Paper 2
  { id: "sub-sy-cvl-2", code: "UCVPC0302", title: "Mechanics of Solids", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-sy-cse-2", code: "UCSPC0302", title: "Advanced Data Structures and Algorithms", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-sy-bio-2", code: "UBTPC0302", title: "Microbiology", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 55, curriculumStructure: "NEP" },
  { id: "sub-sy-mech-2", code: "UMEPC0302", title: "Applied Thermodynamics", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-sy-etc-2", code: "UETPC0302", title: "Differential Equations and Integral Transforms", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-sy-cve-2", code: "UCEPC0302", title: "Fluid Mechanics", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-sy-ele-2", code: "UELPC0302", title: "Electrical Circuit Analysis", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-sy-aiml-2", code: "UAMPC0302", title: "Discrete Mathematics and Graph Theory", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-sy-csbs-2", code: "UCBPC0302", title: "Object Oriented Programming using JAVA", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Paper 3
  { id: "sub-sy-cvl-3", code: "UCVPC0303", title: "Modern Surveying", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-sy-cse-3", code: "UCSPC0303", title: "Design Thinking", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-sy-bio-3", code: "UBTPC0303", title: "Biochemistry", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 55, curriculumStructure: "NEP" },
  { id: "sub-sy-mech-3", code: "UMEPC0303", title: "Materials Engineering", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-sy-etc-3", code: "UETPC0303", title: "Digital System Design", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-sy-cve-3", code: "UCEPC0303", title: "Solid Mechanics", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-sy-ele-3", code: "UELPC0303", title: "Computational Mathematics", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-sy-aiml-3", code: "UAMPC0303", title: "Advanced Data Structures", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-sy-csbs-3", code: "UCBBS0303", title: "Computational Statistics", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Paper 4
  { id: "sub-sy-cvl-4", code: "UCVPC0304", title: "Building Construction and Services", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-sy-cse-4", code: "UCSPC0304", title: "Computer Networks", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-sy-bio-4", code: "UBTPC0304", title: "Cell and Molecular Biology", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 55, curriculumStructure: "NEP" },
  { id: "sub-sy-mech-4", code: "UMEPC0304", title: "Analysis of Mechanical Elements", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-sy-etc-4", code: "UETPC0304", title: "Electronics Instrumentation & Measurement", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-sy-cve-4", code: "UCEPC0304", title: "Surveying and Geospatial Technology", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-sy-ele-4", code: "UELPC0304", title: "Analog Electronics Engineering", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-sy-aiml-4", code: "UAMPC0304", title: "Database Management System", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-sy-csbs-4", code: "UCBPC0304", title: "Software Engineering", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  // Paper 5 (CSBS Exclusive Management Paper)
  { id: "sub-sy-csbs-5", code: "UCBEM0305", title: "Fundamentals of Management", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Second", semester: 3, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // --- T.Y. B.Tech (Sem V) ---
  // Paper 1
  { id: "sub-ty-cvl-1", code: "UCVPC0501", title: "Design of Steel Structures", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-ty-cse-1", code: "UCSPC0501", title: "Database Management Systems", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-ty-bio-1", code: "UBTPC0501", title: "Bioreaction Engineering", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 50, curriculumStructure: "NEP" },
  { id: "sub-ty-mech-1", code: "UMEPC0501", title: "Design of Machine Elements", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-ty-etc-1", code: "UETPC0501", title: "Microcontrollers", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-ty-cve-1", code: "UCEPC0501", title: "Water Supply Engineering", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-ele-1", code: "UELPC0501", title: "Control Systems", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-ty-ds-1", code: "UDSPC0501", title: "Machine Learning", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-aiml-1", code: "UAMPC0501", title: "Machine Learning", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-csbs-1", code: "UCBPC0501", title: "Design and Analysis of Algorithms", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Paper 2
  { id: "sub-ty-cvl-2", code: "UCVPC0502", title: "Theory of Structures", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-ty-cse-2", code: "UCSPC0502", title: "Compiler Design", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-ty-bio-2", code: "UBTPC0502", title: "Mass Transfer", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 50, curriculumStructure: "NEP" },
  { id: "sub-ty-mech-2", code: "UMEPC0502", title: "Mechanical Vibrations", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-ty-etc-2", code: "UETPC0502", title: "Control Systems", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-ty-cve-2", code: "UCEPC0502", title: "Transportation Engineering", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-ele-2", code: "UELPC0502", title: "Electrical Utilization & Traction", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-ty-ds-2", code: "UDSPC0502", title: "Computer Organization and Operating System", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-aiml-2", code: "UAMPC0502", title: "Computer Organization and Operating System", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-csbs-2", code: "UCBPC0502", title: "Compiler Design (LEX & YACC)", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Paper 3
  { id: "sub-ty-cvl-3", code: "UCVPC0503", title: "Geotechnical Engineering", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-ty-cse-3", code: "UCSPC0503", title: "Machine Learning", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-ty-bio-3", code: "UBTPC0503", title: "Fermentation Technology", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 50, curriculumStructure: "NEP" },
  { id: "sub-ty-mech-3", code: "UMEPC0503", title: "Heat Transfer", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-ty-etc-3", code: "UETPC0503", title: "Digital Signal Processing", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-ty-cve-3", code: "UCEPC0503", title: "Air Pollution and Control", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-ele-3", code: "UELPC0503", title: "Power System Analysis", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-ty-ds-3", code: "UDSPC0503", title: "Exploratory Data Analytics", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-aiml-3", code: "UAMPC0503", title: "Exploratory Data Analytics", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-csbs-3", code: "UCBAE0503", title: "Business Communication & Value Science – IV", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Professional Elective I (PE I)
  { id: "sub-ty-cvl-pe1", code: "UCVPE0511", title: "Municipal Wastewater Analysis and Treatment – (PE)", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 40, curriculumStructure: "NEP" },
  { id: "sub-ty-cvl-pe2", code: "UCVPE0514", title: "Open Channel and River Hydraulics (PEI)", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 35, curriculumStructure: "NEP" },
  { id: "sub-ty-cse-pe1", code: "UCSPE0513", title: "Linux Internals (PEI)", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-cse-pe2", code: "UCSPE0514", title: "Human Computer Interface (UI and UX)", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-bio-pe1", code: "UBTPE0511", title: "Cell Culture Technology (PEI)", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 50, curriculumStructure: "NEP" },
  { id: "sub-ty-mech-pe1", code: "UMEPE0511", title: "Automobile and EV Technology (PEI)", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 35, curriculumStructure: "NEP" },
  { id: "sub-ty-mech-pe2", code: "UMEPE0513", title: "Machine Tool Design (PEI)", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-mech-pe3", code: "UMEPE0514", title: "Design Thinking (PEI)", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 25, curriculumStructure: "NEP" },
  { id: "sub-ty-etc-pe1", code: "UETPE0511", title: "Antenna and Wave Propagation (PEI)", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-etc-pe2", code: "UETPE0513", title: "Electronic System Design (PEI)", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-etc-pe3", code: "UETPE0514", title: "Computer Architecture & Organization (PEI)", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 25, curriculumStructure: "NEP" },
  { id: "sub-ty-cve-pe1", code: "UCEPE0513", title: "Construction Practices (PEI)", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-ele-pe1", code: "UELPE0513", title: "Renewable Energy Sources (PEI)", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-ty-ds-pe1", code: "UDSPE0511", title: "Human Computer Interaction (UI/UX) (PEI)", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-ds-pe2", code: "UDSPE0512", title: "Intelligent Robot (PEI)", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-aiml-pe1", code: "UAMPE0511", title: "Human Computer Interaction (UI/UX) (PEI)", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-aiml-pe2", code: "UAMPE0512", title: "Intelligent Robot (PEI)", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-csbs-pe1", code: "UCBPE0511", title: "Cloud, Microservices & Application (PEI)", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-csbs-pe2", code: "UCBPE0512", title: "Artificial Intelligence (PEI)", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },

  // Open Elective I (OE I)
  { id: "sub-ty-cvl-oe1", code: "UILOE0530", title: "Green Buildings (OEI)", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 45, curriculumStructure: "NEP" },
  { id: "sub-ty-cvl-oe2", code: "UILOE0528", title: "Human Resource Development", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-cse-oe1", code: "UCSOE0521", title: "Customer Relationship Management (OEI)", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-ty-bio-oe1", code: "UILOE0527", title: "Leadership & Corporate Strategy (OEI)", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 50, curriculumStructure: "NEP" },
  { id: "sub-ty-mech-oe1", code: "UILOE0526", title: "Product Design and Manufacturing (OEI)", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-ty-etc-oe1", code: "UILOE0522", title: "Global Marketing Management (OEI)", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-ty-cve-oe1", code: "UILOE0524", title: "Water Resources Management (OEI)", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-ty-ele-oe1", code: "UILOE0525", title: "Agile Project Management (OEI)", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-ty-ds-oe1", code: "UILOE0529", title: "Corporate Finance (OEI)", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-ty-csbs-oe1", code: "UCBOE0521", title: "Introduction to Data Analytics (OEI)", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-ty-csbs-oe2", code: "UCBOE0523", title: "Cyber Security", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Third", semester: 5, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },

  // --- Final Year B.Tech (Sem VII) ---
  // Paper 1
  { id: "sub-fin-cvl-1", code: "UCVPC0701", title: "Quantity Surveying", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-fin-cse-1", code: "UCSPC0701", title: "Big Data Analytic", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-fin-bio-1", code: "UBTPC0701", title: "Analytical Techniques in Biotechnology", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 45, curriculumStructure: "NEP" },
  { id: "sub-fin-mech-1", code: "UMEPC0701", title: "Industrial Automation and Robotics", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-fin-etc-1", code: "UETPC0701", title: "Mobile Communication Network", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-fin-cve-1", code: "UCEPC0701", title: "Design of Concrete Structures", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-ele-1", code: "UELPC0701", title: "Industrial Automation", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-fin-ds-1", code: "UDSPC0701", title: "Information Security", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-aiml-1", code: "UAMPC0701", title: "Information Security", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-csbs-1", code: "UCBPC0701", title: "Usability Design of Software Applications", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Paper 2
  { id: "sub-fin-cvl-2", code: "UCVPC0702", title: "Structural Dynamics & Earthquake Engineering", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-fin-cse-2", code: "UCSPC0702", title: "Cloud Computing", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-fin-bio-2", code: "UBTPC0702", title: "Good Manufacturing Practices", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 45, curriculumStructure: "NEP" },
  { id: "sub-fin-mech-2", code: "UMEPC0702", title: "Advanced Manufacturing Engineering", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-fin-etc-2", code: "UETPC0702", title: "Power Electronics", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-fin-cve-2", code: "UCEPC0702", title: "Advanced Water and Wastewater Treatment", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-ele-2", code: "UELPC0702", title: "Power Quality", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-fin-ds-2", code: "UDSPC0702", title: "Generative and Agentic AI", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-aiml-2", code: "UAMPC0702", title: "Generative AI", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-csbs-2", code: "UCBPC0702", title: "Natural Language Processing", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Paper 3
  { id: "sub-fin-cvl-3", code: "UCVPC0703", title: "Water Resource Engineering", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-fin-cse-3", code: "UCSPC0703", title: "Software Testing & Quality Assurance", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 120, curriculumStructure: "NEP" },
  { id: "sub-fin-bio-3", code: "UBTPC0703", title: "Process Engineering Costing and Plant design", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 45, curriculumStructure: "NEP" },
  { id: "sub-fin-mech-3", code: "UMEPC0703", title: "HVAC and Refrigeration Systems", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-fin-etc-3", code: "UETPC0703", title: "RF & Microwave Engineering", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-fin-cve-3", code: "UCEPC0703", title: "Quantity Surveying and Valuation", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-ele-3", code: "UELPC0703", title: "HVDC & FACTS", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-fin-ds-3", code: "UDSPC0703", title: "Internet of Things & Cloud Computing", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-aiml-3", code: "UAMPC0703", title: "Internet of Things & Cloud Computing", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-csbs-3", code: "UCBPC0703", title: "Software Testing", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // Professional Elective III (PE III)
  { id: "sub-fin-cvl-pe1", code: "UCVPE0711", title: "Transportation And Smart City Planning – (PE)", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 40, curriculumStructure: "NEP" },
  { id: "sub-fin-cvl-pe2", code: "UCVPE0712", title: "Structural Health Monitoring and Retrofitting – (PE)", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 35, curriculumStructure: "NEP" },
  { id: "sub-fin-cse-pe1", code: "UCSPE0711", title: "Deep Learning", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 45, curriculumStructure: "NEP" },
  { id: "sub-fin-cse-pe2", code: "UCSPE0712", title: "IoTSecurity and Privacy", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 40, curriculumStructure: "NEP" },
  { id: "sub-fin-cse-pe3", code: "UCSPE0713", title: "Natural Language Processing", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 35, curriculumStructure: "NEP" },
  { id: "sub-fin-bio-pe1", code: "UBTPE0711", title: "Biopharmaceuticals (PE III)", departmentCode: "BIO", programCode: "BTECH-BIO", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 45, curriculumStructure: "NEP" },
  { id: "sub-fin-mech-pe1", code: "UMEPE0711", title: "Design of Mechanical Systems (PE III)", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-fin-etc-pe1", code: "UETPE0712", title: "Mechatronics", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 45, curriculumStructure: "NEP" },
  { id: "sub-fin-etc-pe2", code: "UETPE0714", title: "Optical Fiber communication", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 40, curriculumStructure: "NEP" },
  { id: "sub-fin-cve-pe1", code: "UCEPE0711", title: "Environment, Health and Safety (PEIII)", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },
  { id: "sub-fin-ele-pe1", code: "UELPE0713", title: "Electrical Vehicle Technology", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-fin-ds-pe1", code: "UDSPE0711", title: "Data and Storytelling (PE-III)", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-fin-ds-pe2", code: "UDSPE0713", title: "Big Data Analytics (PE-III)", departmentCode: "CSEDS", programCode: "BTECH-CSEDS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-fin-aiml-pe1", code: "UAMPE0711", title: "Data and Storytelling (PE-III)", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-fin-aiml-pe2", code: "UAMPE0713", title: "Big Data Analytics (PE-III)", departmentCode: "CSEAIML", programCode: "BTECH-CSEAIML", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-fin-csbs-pe1", code: "UCBPE0711", title: "Image Processing and Pattern Recognition", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 20, curriculumStructure: "NEP" },
  { id: "sub-fin-csbs-pe2", code: "UCBPE0712", title: "Introduction to IoT", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 20, curriculumStructure: "NEP" },
  { id: "sub-fin-csbs-pe3", code: "UCBPE0713", title: "Deep Learning", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 20, curriculumStructure: "NEP" },

  // Open Elective III (OE III)
  { id: "sub-fin-cvl-oe1", code: "UILOE0726", title: "Urban and Rural Planning", departmentCode: "CVL", programCode: "BTECH-CVL", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 75, curriculumStructure: "NEP" },
  { id: "sub-fin-mech-oe1", code: "UILOE0731", title: "Incubation and Entrepreneurship Enhancement", departmentCode: "MECH", programCode: "BTECH-MECH", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 90, curriculumStructure: "NEP" },
  { id: "sub-fin-etc-oe1", code: "UILOE0724", title: "Industrial Instrumentation", departmentCode: "ETC", programCode: "BTECH-ETC", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 85, curriculumStructure: "NEP" },
  { id: "sub-fin-cve-oe1", code: "UILOE0729", title: "Environmental Policies & Laws (OE III)", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-fin-cve-oe2", code: "UILOE0730", title: "Environmental Impact Assessment (OE III)", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "NEP" },
  { id: "sub-fin-ele-oe1", code: "UELOE0725", title: "Sustainable Energy Systems", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 70, curriculumStructure: "NEP" },
  { id: "sub-fin-csbs-oe1", code: "UCBOE0721", title: "Generative AI Tools & Techniques", departmentCode: "CSBS", programCode: "BTECH-CSBS", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 60, curriculumStructure: "NEP" },

  // --- Final Year Cycle 2 Backlogs ---
  { id: "sub-c2-cse-1", code: "UCSC0701", title: "Cloud Computing", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 30, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cve-1", code: "UCEC0701", title: "Design of Concrete Structures", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 25, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-ele-1", code: "UELC0701", title: "Industrial Automation", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 20, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cse-2", code: "UCSC0702", title: "Advanced Database Systems", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 28, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cve-2", code: "UCEC0702", title: "Advanced Water and Wastewater Treatment", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 22, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-ele-2", code: "UELC0702", title: "Electrical Machine Design", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 18, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cse-3", code: "UCSC0703", title: "Software Testing and Quality Assurance", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 24, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cve-3", code: "UCEC0703", title: "Quantity Surveying and Valuation", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 20, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-ele-3", code: "UELC0703", title: "Smart Grid", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 4, lectureHours: 3, tutorialHours: 1, practicalHours: 0, status: "Active", enrolledStudents: 15, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cse-pe1", code: "UCSPE701", title: "Digital Image Processing", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 18, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cse-pe2", code: "UCSPE702", title: "Blockchain and Cryptocurrencies", departmentCode: "CSE", programCode: "BTECH-CSE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 16, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cve-pe1", code: "UCEE0721", title: "Environment, Health and Safety", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 20, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-ele-pe1", code: "UELC0742", title: "Electric Vehicle Design", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 15, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-cve-oe1", code: "UCEC0704", title: "Environmental Impact Assessment and Legislation", departmentCode: "CVL & ENV", programCode: "BTECH-CVL_ENV", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 22, curriculumStructure: "CYCLE 2" },
  { id: "sub-c2-ele-oe1", code: "UELC0704", title: "Advanced Control Systems", departmentCode: "ELE", programCode: "BTECH-ELE", academicYear: "2026-27", yearOfStudy: "Fourth", semester: 7, type: "Theory", credits: 3, lectureHours: 3, tutorialHours: 0, practicalHours: 0, status: "Active", enrolledStudents: 18, curriculumStructure: "CYCLE 2" },
];

// Helper to generate full timetable entries for ESE 2026
function generateKitESETimetable(): CoordinatorExamEntry[] {
  const list: CoordinatorExamEntry[] = [];
  const cycleId = "cycle-ese-2026";
  const durationMinutes = 150;

  // Comprehensive 26-Hall Institutional Campus Pool (Guarantees zero room overlap even with 20 parallel electives)
  const halls = [
    "Examination Hall A-101",
    "Examination Hall A-102",
    "Examination Hall A-103",
    "Examination Hall B-201",
    "Examination Hall B-204",
    "Examination Hall B-205",
    "Engineering Hall C-301",
    "Engineering Hall C-302",
    "Engineering Hall C-303",
    "Computing Lab D-105",
    "Computing Lab D-106",
    "Computing Lab D-107",
    "Computing Lab D-108",
    "Central Auditorium 1",
    "Central Auditorium 2",
    "Drawing Hall E-201",
    "Drawing Hall E-202",
    "Seminar Hall 1",
    "Seminar Hall 2",
    "Hall F-101",
    "Hall F-102",
    "Hall F-103",
    "Lab G-301",
    "Lab G-302",
    "Lecture Hall H-101",
    "Lecture Hall H-102",
  ];

  const invigilators = [
    "Dr. Arvind Sharma (CSE)",
    "Prof. Rohini Iyer (ECE)",
    "Dr. Pramod Kulkarni (MECH)",
    "Dr. S. Nair (CIVIL)",
    "Dr. A. Verma (EE)",
    "Prof. S. Patil (CSE)",
    "Dr. M. Roy (ECE)",
    "Rohit Sharma (AIDS)",
    "Prof. Rajesh Kulkarni (CSE)",
    "Dr. Meenakshi Sundaram (CSE)",
    "Dr. Ramesh Patil (MECH)",
    "Dr. S. K. Joshi (CIVIL)",
    "Dr. Anjali Patil (BIO)",
    "Dr. Vikram Joshi (CSEDS)",
    "Dr. Suresh Kulkarni (CSBS)",
    "Dr. R. V. Kulkarni (CVL & ENV)",
    "Prof. K. N. Rao (EE)",
    "Dr. Sneha Deshmukh (ECE)",
    "Prof. Amit Kadam (MECH)",
    "Dr. Pooja Shah (CSE)",
    "Prof. Nikhil Shinde (CIVIL)",
    "Dr. Sandeep Chavan (AIDS)",
    "Prof. Deepa Mane (BIO)",
    "Dr. Vinay More (CSEDS)",
    "Prof. Sunita Gaikwad (CSBS)",
    "Dr. Harish Salunkhe (MECH)",
  ];

  // Schedule Map Definition
  // Day 1: 2026-11-22 (Sunday)
  // Day 2: 2026-11-24 (Tuesday)
  // Day 3: 2026-11-26 (Thursday)
  // Day 4: 2026-11-28 (Saturday)
  // Day 5: 2026-11-30 (Monday)
  // Day 6: 2026-12-02 (Wednesday - Cycle 2 Core)
  // Day 7: 2026-12-04 (Friday - Cycle 2 Electives & OE)

  const scheduleConfig: Array<{
    date: string;
    slot: string;
    yearOfStudy: "Second" | "Third" | "Fourth";
    semester: number;
    subjectCodes: string[];
  }> = [
    // --- DAY 1: 22.11.2026 (Sunday) ---
    {
      date: "2026-11-22",
      slot: "10.00 AM TO 12.30 PM",
      yearOfStudy: "Second",
      semester: 3,
      subjectCodes: ["UCVPC0301", "UCSPC0301", "UBTPC0301", "UMEPC0301", "UETPC0301", "UCEPC0301", "UELPC0301", "UAMPC0301", "UCBPC0301"],
    },
    {
      date: "2026-11-22",
      slot: "01.30 PM TO 04.00 PM",
      yearOfStudy: "Third",
      semester: 5,
      subjectCodes: ["UCVPC0501", "UCSPC0501", "UBTPC0501", "UMEPC0501", "UETPC0501", "UCEPC0501", "UELPC0501", "UDSPC0501", "UAMPC0501", "UCBPC0501"],
    },
    {
      date: "2026-11-22",
      slot: "04.30 PM TO 07.00 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: ["UCVPC0701", "UCSPC0701", "UBTPC0701", "UMEPC0701", "UETPC0701", "UCEPC0701", "UELPC0701", "UDSPC0701", "UAMPC0701", "UCBPC0701"],
    },

    // --- DAY 2: 24.11.2026 (Tuesday) ---
    {
      date: "2026-11-24",
      slot: "10.00 AM TO 12.30 PM",
      yearOfStudy: "Second",
      semester: 3,
      subjectCodes: ["UCVPC0302", "UCSPC0302", "UBTPC0302", "UMEPC0302", "UETPC0302", "UCEPC0302", "UELPC0302", "UAMPC0302", "UCBPC0302"],
    },
    {
      date: "2026-11-24",
      slot: "01.30 PM TO 04.00 PM",
      yearOfStudy: "Third",
      semester: 5,
      subjectCodes: ["UCVPC0502", "UCSPC0502", "UBTPC0502", "UMEPC0502", "UETPC0502", "UCEPC0502", "UELPC0502", "UDSPC0502", "UAMPC0502", "UCBPC0502"],
    },
    {
      date: "2026-11-24",
      slot: "04.30 PM TO 07.00 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: ["UCVPC0702", "UCSPC0702", "UBTPC0702", "UMEPC0702", "UETPC0702", "UCEPC0702", "UELPC0702", "UDSPC0702", "UAMPC0702", "UCBPC0702"],
    },

    // --- DAY 3: 26.11.2026 (Thursday) ---
    {
      date: "2026-11-26",
      slot: "10.00 AM TO 12.30 PM",
      yearOfStudy: "Second",
      semester: 3,
      subjectCodes: ["UCVPC0303", "UCSPC0303", "UBTPC0303", "UMEPC0303", "UETPC0303", "UCEPC0303", "UELPC0303", "UAMPC0303", "UCBBS0303"],
    },
    {
      date: "2026-11-26",
      slot: "01.30 PM TO 04.00 PM",
      yearOfStudy: "Third",
      semester: 5,
      subjectCodes: ["UCVPC0503", "UCSPC0503", "UBTPC0503", "UMEPC0503", "UETPC0503", "UCEPC0503", "UELPC0503", "UDSPC0503", "UAMPC0503", "UCBAE0503"],
    },
    {
      date: "2026-11-26",
      slot: "04.30 PM TO 07.00 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: ["UCVPC0703", "UCSPC0703", "UBTPC0703", "UMEPC0703", "UETPC0703", "UCEPC0703", "UELPC0703", "UDSPC0703", "UAMPC0703", "UCBPC0703"],
    },

    // --- DAY 4: 28.11.2026 (Saturday) ---
    {
      date: "2026-11-28",
      slot: "10.00 AM TO 12.30 PM",
      yearOfStudy: "Second",
      semester: 3,
      subjectCodes: ["UCVPC0304", "UCSPC0304", "UBTPC0304", "UMEPC0304", "UETPC0304", "UCEPC0304", "UELPC0304", "UAMPC0304", "UCBPC0304"],
    },
    {
      date: "2026-11-28",
      slot: "01.30 PM TO 04.00 PM",
      yearOfStudy: "Third",
      semester: 5,
      subjectCodes: [
        "UCVPE0511", "UCVPE0514", "UCSPE0513", "UCSPE0514", "UBTPE0511",
        "UMEPE0511", "UMEPE0513", "UMEPE0514", "UETPE0511", "UETPE0513", "UETPE0514",
        "UCEPE0513", "UELPE0513", "UDSPE0511", "UDSPE0512", "UAMPE0511", "UAMPE0512",
        "UCBPE0511", "UCBPE0512",
      ],
    },
    {
      date: "2026-11-28",
      slot: "04.30 PM TO 07.00 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: [
        "UCVPE0711", "UCVPE0712", "UCSPE0711", "UCSPE0712", "UCSPE0713",
        "UBTPE0711", "UMEPE0711", "UETPE0712", "UETPE0714", "UCEPE0711",
        "UELPE0713", "UDSPE0711", "UDSPE0713", "UAMPE0711", "UAMPE0713",
        "UCBPE0711", "UCBPE0712", "UCBPE0713",
      ],
    },

    // --- DAY 5: 30.11.2026 (Monday) ---
    {
      date: "2026-11-30",
      slot: "10.00 AM TO 12.30 PM",
      yearOfStudy: "Second",
      semester: 3,
      subjectCodes: ["UCBEM0305"],
    },
    {
      date: "2026-11-30",
      slot: "01.30 PM TO 04.00 PM",
      yearOfStudy: "Third",
      semester: 5,
      subjectCodes: [
        "UILOE0530", "UILOE0528", "UCSOE0521", "UILOE0527", "UILOE0526",
        "UILOE0522", "UILOE0524", "UILOE0525", "UILOE0529", "UCBOE0521", "UCBOE0523",
      ],
    },
    {
      date: "2026-11-30",
      slot: "04.30 PM TO 07.00 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: [
        "UILOE0726", "UILOE0731", "UILOE0724", "UILOE0729", "UILOE0730",
        "UELOE0725", "UCBOE0721",
      ],
    },

    // --- DAY 6: 02.12.2026 (Wednesday - Strict H6 Backlog Core Separation) ---
    {
      date: "2026-12-02",
      slot: "10.00 AM TO 12.30 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: ["UCSC0701", "UCEC0701", "UELC0701"],
    },
    {
      date: "2026-12-02",
      slot: "01.30 PM TO 04.00 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: ["UCSC0702", "UCEC0702", "UELC0702"],
    },
    {
      date: "2026-12-02",
      slot: "04.30 PM TO 07.00 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: ["UCSC0703", "UCEC0703", "UELC0703"],
    },

    // --- DAY 7: 04.12.2026 (Friday - Strict H6 Backlog Elective & OE Separation) ---
    {
      date: "2026-12-04",
      slot: "10.00 AM TO 12.30 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: ["UCSPE701", "UCSPE702", "UCEE0721", "UELC0742"],
    },
    {
      date: "2026-12-04",
      slot: "01.30 PM TO 04.00 PM",
      yearOfStudy: "Fourth",
      semester: 7,
      subjectCodes: ["UCEC0704", "UELC0704"],
    },
  ];

  // Build exam entries with strict non-collision guarantee
  scheduleConfig.forEach((cfg, blockIdx) => {
    const sessionBookedRooms = new Set<string>();
    const sessionBookedInvigs = new Set<string>();

    cfg.subjectCodes.forEach((code, codeIdx) => {
      const sub = KIT_ESE_2026_SUBJECTS.find((s) => s.code === code);
      if (!sub) return;

      // Select unique room for this date & slot
      let room = halls[codeIdx % halls.length];
      if (sessionBookedRooms.has(room)) {
        const freeHall = halls.find((h) => !sessionBookedRooms.has(h));
        if (freeHall) room = freeHall;
      }
      sessionBookedRooms.add(room);

      // Select unique invigilator for this date & slot
      let invigilator = invigilators[codeIdx % invigilators.length];
      if (sessionBookedInvigs.has(invigilator)) {
        const freeInv = invigilators.find((i) => !sessionBookedInvigs.has(i));
        if (freeInv) invigilator = freeInv;
      }
      sessionBookedInvigs.add(invigilator);

      list.push({
        id: `ese26-${sub.code.toLowerCase()}-${blockIdx}-${codeIdx}`,
        cycleId,
        code: sub.code,
        subject: sub.title,
        department: sub.departmentCode,
        programCode: sub.programCode,
        semester: sub.semester,
        yearOfStudy: sub.yearOfStudy,
        examType: "ESE",
        enrolled: sub.enrolledStudents || 60,
        date: cfg.date,
        slot: cfg.slot,
        room,
        invigilator,
        status: "Approved",
        isIncluded: true,
        durationMinutes,
        curriculumStructure: sub.curriculumStructure || "NEP",
      });
    });
  });

  return list;
}

export const KIT_ESE_2026_TIMETABLE: CoordinatorExamEntry[] = generateKitESETimetable();
