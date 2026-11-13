// =========================================================================
// KIT Student Data — Comprehensive realistic student records for
// KIT's College of Engineering, Kolhapur — Odd Semester 2026-27
// Odd semester mapping: First Year→Sem1, 2nd→Sem3, 3rd→Sem5, 4th→Sem7
// =========================================================================

export type YearOfStudy = "First" | "Second" | "Third" | "Fourth";

export interface KitStudentRecord {
  id: string;
  name: string;
  email: string;
  rollNumber: string; // e.g. CSE2024001 = dept+admissionYear+serial
  departmentCode: string;
  currentSemester: 1 | 3 | 5 | 7; // Odd semester only
  yearOfStudy: YearOfStudy;
  attendancePercentage: number; // 60–98; some <75 = ineligible
  status: "ACTIVE";
  programCode: string;
  division: "A" | "B";
  enrolledSubjectCodes: string[];
}

// ---------------------------------------------------------------------------
// SUBJECT CODES PER DEPT PER SEMESTER (from kitExamData.ts KIT_ESE_2026_SUBJECTS)
// ---------------------------------------------------------------------------

const SEM1_SUBJECTS: Record<string, string[]> = {
  // No formal KIT sem-1 subjects in kitExamData (only sem 3,5,7).
  // Using common first-year subject codes that will be added by backend.
  CSE:     ["KIT101", "KIT102", "KIT103", "KIT104", "KIT105"],
  ETC:     ["KIT101", "KIT102", "KIT103", "KIT104", "KIT106"],
  MECH:    ["KIT101", "KIT102", "KIT107", "KIT104", "KIT108"],
  CVL:     ["KIT101", "KIT102", "KIT107", "KIT109", "KIT110"],
  ELE:     ["KIT101", "KIT102", "KIT103", "KIT111", "KIT112"],
  CSEAIML: ["KIT101", "KIT102", "KIT103", "KIT104", "KIT113"],
  CSEDS:   ["KIT101", "KIT102", "KIT103", "KIT104", "KIT114"],
  CSBS:    ["KIT101", "KIT102", "KIT103", "KIT104", "KIT115"],
  BIO:     ["KIT101", "KIT102", "KIT116", "KIT117", "KIT118"],
};

const SEM3_SUBJECTS: Record<string, string[]> = {
  CSE:     ["UCSPC0301", "UCSPC0302", "UCSPC0303", "UCSPC0304"],
  ETC:     ["UETPC0301", "UETPC0302", "UETPC0303", "UETPC0304"],
  MECH:    ["UMEPC0301", "UMEPC0302", "UMEPC0303", "UMEPC0304"],
  CVL:     ["UCVPC0301", "UCVPC0302", "UCVPC0303", "UCVPC0304"],
  ELE:     ["UELPC0301", "UELPC0302", "UELPC0303", "UELPC0304"],
  CSEAIML: ["UAMPC0301", "UAMPC0302", "UAMPC0303", "UAMPC0304"],
  CSEDS:   ["UAMPC0301", "UAMPC0302", "UAMPC0303", "UAMPC0304"],
  CSBS:    ["UCBPC0301", "UCBPC0302", "UCBBS0303", "UCBPC0304", "UCBEM0305"],
  BIO:     ["UBTPC0301", "UBTPC0302", "UBTPC0303", "UBTPC0304"],
};

const SEM5_SUBJECTS: Record<string, string[]> = {
  CSE:     ["UCSPC0501", "UCSPC0502", "UCSPC0503", "UCSPE0513", "UCSOE0521"],
  ETC:     ["UETPC0501", "UETPC0502", "UETPC0503", "UETPE0511", "UILOE0522"],
  MECH:    ["UMEPC0501", "UMEPC0502", "UMEPC0503", "UMEPE0511", "UILOE0526"],
  CVL:     ["UCVPC0501", "UCVPC0502", "UCVPC0503", "UCVPE0511", "UILOE0530"],
  ELE:     ["UELPC0501", "UELPC0502", "UELPC0503", "UELPE0513", "UILOE0525"],
  CSEAIML: ["UAMPC0501", "UAMPC0502", "UAMPC0503", "UAMPE0511", "UILOE0529"],
  CSEDS:   ["UDSPC0501", "UDSPC0502", "UDSPC0503", "UDSPE0511", "UILOE0529"],
  CSBS:    ["UCBPC0501", "UCBPC0502", "UCBAE0503", "UCBPE0511", "UCBOE0521"],
  BIO:     ["UBTPC0501", "UBTPC0502", "UBTPC0503", "UBTPE0511", "UILOE0527"],
};

const SEM7_SUBJECTS: Record<string, string[]> = {
  CSE:     ["UCSPC0701", "UCSPC0702", "UCSPC0703", "UCSPE0711", "UILOE0726"],
  ETC:     ["UETPC0701", "UETPC0702", "UETPC0703", "UETPE0712", "UILOE0724"],
  MECH:    ["UMEPC0701", "UMEPC0702", "UMEPC0703", "UMEPE0711", "UILOE0731"],
  CVL:     ["UCVPC0701", "UCVPC0702", "UCVPC0703", "UCVPE0711", "UILOE0726"],
  ELE:     ["UELPC0701", "UELPC0702", "UELPC0703", "UELPE0713", "UELOE0725"],
  CSEAIML: ["UAMPC0701", "UAMPC0702", "UAMPC0703", "UAMPE0711", "UILOE0726"],
  CSEDS:   ["UDSPC0701", "UDSPC0702", "UDSPC0703", "UDSPE0711", "UILOE0726"],
  CSBS:    ["UCBPC0701", "UCBPC0702", "UCBPC0703", "UCBPE0711", "UCBOE0721"],
  BIO:     ["UBTPC0701", "UBTPC0702", "UBTPC0703", "UBTPE0711", "UILOE0726"],
};

function subjectsFor(dept: string, sem: 1 | 3 | 5 | 7): string[] {
  if (sem === 1) return SEM1_SUBJECTS[dept] ?? SEM1_SUBJECTS["CSE"];
  if (sem === 3) return SEM3_SUBJECTS[dept] ?? SEM3_SUBJECTS["CSE"];
  if (sem === 5) return SEM5_SUBJECTS[dept] ?? SEM5_SUBJECTS["CSE"];
  return SEM7_SUBJECTS[dept] ?? SEM7_SUBJECTS["CSE"];
}

function yearFromSem(sem: 1 | 3 | 5 | 7): YearOfStudy {
  if (sem === 1) return "First";
  if (sem === 3) return "Second";
  if (sem === 5) return "Third";
  return "Fourth";
}

function admissionYearFromSem(sem: 1 | 3 | 5 | 7): string {
  // Sem 7 (4th year) → joined 2023, Sem 5 → 2024, Sem 3 → 2025, Sem 1 → 2026
  const base: Record<number, string> = { 7: "2023", 5: "2024", 3: "2025", 1: "2026" };
  return base[sem];
}

function makeEmail(name: string, _dept: string, _serial: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
  return `${slug}@kit.edu`;
}

function s(
  id: string,
  name: string,
  dept: string,
  prog: string,
  sem: 1 | 3 | 5 | 7,
  serial: string,
  attendance: number,
  division: "A" | "B"
): KitStudentRecord {
  const admYear = admissionYearFromSem(sem);
  const rollNumber = `${dept}${admYear}${serial}`;
  return {
    id,
    name,
    email: makeEmail(name, dept, serial),
    rollNumber,
    departmentCode: dept,
    currentSemester: sem,
    yearOfStudy: yearFromSem(sem),
    attendancePercentage: attendance,
    status: "ACTIVE",
    programCode: prog,
    division,
    enrolledSubjectCodes: subjectsFor(dept, sem),
  };
}

// =========================================================================
// KIT_STUDENTS_DATA — 80+ students across all departments and years
// =========================================================================
export const KIT_STUDENTS_DATA: KitStudentRecord[] = [

  // -----------------------------------------------------------------------
  // CSE — 20 students (5 per year)
  // -----------------------------------------------------------------------

  // CSE First Year (Sem 1) — admitted 2026
  s("stu-cse-1-01", "Arjun Kulkarni",         "CSE", "BTECH-CSE", 1, "001", 88, "A"),
  s("stu-cse-1-02", "Priya Deshpande",         "CSE", "BTECH-CSE", 1, "002", 72, "A"),
  s("stu-cse-1-03", "Rohan Patil",             "CSE", "BTECH-CSE", 1, "003", 91, "B"),
  s("stu-cse-1-04", "Sneha Jadhav",            "CSE", "BTECH-CSE", 1, "004", 65, "B"),
  s("stu-cse-1-05", "Nikhil Shinde",           "CSE", "BTECH-CSE", 1, "005", 80, "A"),

  // CSE Second Year (Sem 3) — admitted 2025
  s("stu-cse-3-01", "Aarav Sharma",            "CSE", "BTECH-CSE", 3, "001", 88, "A"),
  s("stu-cse-3-02", "Ananya Roy",              "CSE", "BTECH-CSE", 3, "002", 92, "A"),
  s("stu-cse-3-03", "Vikram Bhosale",          "CSE", "BTECH-CSE", 3, "003", 68, "B"),
  s("stu-cse-3-04", "Pooja Kulkarni",          "CSE", "BTECH-CSE", 3, "004", 76, "B"),
  s("stu-cse-3-05", "Tanmay Desai",            "CSE", "BTECH-CSE", 3, "005", 95, "A"),

  // CSE Third Year (Sem 5) — admitted 2024
  s("stu-cse-5-01", "Neha Kamble",             "CSE", "BTECH-CSE", 5, "001", 83, "A"),
  s("stu-cse-5-02", "Sahil More",              "CSE", "BTECH-CSE", 5, "002", 71, "B"),
  s("stu-cse-5-03", "Rutuja Pawar",            "CSE", "BTECH-CSE", 5, "003", 90, "A"),
  s("stu-cse-5-04", "Abhishek Joshi",          "CSE", "BTECH-CSE", 5, "004", 62, "B"),
  s("stu-cse-5-05", "Mayuri Gaikwad",          "CSE", "BTECH-CSE", 5, "005", 85, "A"),

  // CSE Fourth Year (Sem 7) — admitted 2023
  s("stu-cse-7-01", "Gaurav Mishra",           "CSE", "BTECH-CSE", 7, "001", 95, "A"),
  s("stu-cse-7-02", "Bhavna Iyer",             "CSE", "BTECH-CSE", 7, "002", 90, "A"),
  s("stu-cse-7-03", "Rohan Verma",             "CSE", "BTECH-CSE", 7, "003", 68, "B"),
  s("stu-cse-7-04", "Kavita Deshmukh",         "CSE", "BTECH-CSE", 7, "004", 82, "A"),
  s("stu-cse-7-05", "Suresh Raina",            "CSE", "BTECH-CSE", 7, "005", 85, "B"),

  // -----------------------------------------------------------------------
  // ETC — 10 students (mix of years)
  // -----------------------------------------------------------------------

  s("stu-etc-1-01", "Rahul Chaudhari",         "ETC", "BTECH-ETC", 1, "001", 78, "A"),
  s("stu-etc-1-02", "Shruti Mane",             "ETC", "BTECH-ETC", 1, "002", 65, "B"),
  s("stu-etc-3-01", "Siddharth Kadam",         "ETC", "BTECH-ETC", 3, "001", 86, "A"),
  s("stu-etc-3-02", "Pallavi Sawant",          "ETC", "BTECH-ETC", 3, "002", 73, "B"),
  s("stu-etc-5-01", "Amol Kumbhar",            "ETC", "BTECH-ETC", 5, "001", 81, "A"),
  s("stu-etc-5-02", "Deepa Nair",              "ETC", "BTECH-ETC", 5, "002", 60, "B"),
  s("stu-etc-7-01", "Vikram Malhotra",         "ETC", "BTECH-ETC", 7, "001", 84, "A"),
  s("stu-etc-7-02", "Tanvi Mehta",             "ETC", "BTECH-ETC", 7, "002", 85, "A"),
  s("stu-etc-7-03", "Harish Suryawanshi",      "ETC", "BTECH-ETC", 7, "003", 93, "B"),
  s("stu-etc-7-04", "Ishaan Trivedi",          "ETC", "BTECH-ETC", 7, "004", 87, "A"),

  // -----------------------------------------------------------------------
  // MECH — 10 students (mix of years)
  // -----------------------------------------------------------------------

  s("stu-mech-1-01", "Ajay Chougule",          "MECH", "BTECH-MECH", 1, "001", 76, "A"),
  s("stu-mech-1-02", "Prachi Waghmare",        "MECH", "BTECH-MECH", 1, "002", 69, "B"),
  s("stu-mech-3-01", "Sachin Jadhav",          "MECH", "BTECH-MECH", 3, "001", 88, "A"),
  s("stu-mech-3-02", "Swati Desai",            "MECH", "BTECH-MECH", 3, "002", 77, "B"),
  s("stu-mech-5-01", "Mahesh Pawar",           "MECH", "BTECH-MECH", 5, "001", 83, "A"),
  s("stu-mech-5-02", "Pooja Bhosale",          "MECH", "BTECH-MECH", 5, "002", 64, "B"),
  s("stu-mech-7-01", "Sneha Deshmukh",         "MECH", "BTECH-MECH", 7, "001", 86, "A"),
  s("stu-mech-7-02", "Nikhil Rathi",           "MECH", "BTECH-MECH", 7, "002", 81, "A"),
  s("stu-mech-7-03", "Harsh Vardhan",          "MECH", "BTECH-MECH", 7, "003", 82, "B"),
  s("stu-mech-7-04", "Manasi Kulkarni",        "MECH", "BTECH-MECH", 7, "004", 75, "A"),

  // -----------------------------------------------------------------------
  // CVL — 8 students (mix of years)
  // -----------------------------------------------------------------------

  s("stu-cvl-1-01", "Ashwin Patil",            "CVL", "BTECH-CVL", 1, "001", 82, "A"),
  s("stu-cvl-3-01", "Nilesh Kulkarni",         "CVL", "BTECH-CVL", 3, "001", 79, "A"),
  s("stu-cvl-3-02", "Anjali Deshpande",        "CVL", "BTECH-CVL", 3, "002", 67, "B"),
  s("stu-cvl-5-01", "Sumit Shinde",            "CVL", "BTECH-CVL", 5, "001", 91, "A"),
  s("stu-cvl-5-02", "Priyanka Mane",           "CVL", "BTECH-CVL", 5, "002", 74, "B"),
  s("stu-cvl-7-01", "Amitabh Sen",             "CVL", "BTECH-CVL", 7, "001", 83, "A"),
  s("stu-cvl-7-02", "Meenakshi Chavan",        "CVL", "BTECH-CVL", 7, "002", 70, "B"),
  s("stu-cvl-7-03", "Santosh Mohite",          "CVL", "BTECH-CVL", 7, "003", 89, "A"),

  // -----------------------------------------------------------------------
  // ELE — 8 students (mix of years)
  // -----------------------------------------------------------------------

  s("stu-ele-1-01", "Ravi Salunkhe",           "ELE", "BTECH-ELE", 1, "001", 86, "A"),
  s("stu-ele-3-01", "Deepak Bagade",           "ELE", "BTECH-ELE", 3, "001", 75, "A"),
  s("stu-ele-3-02", "Sangeetha Rao",           "ELE", "BTECH-ELE", 3, "002", 61, "B"),
  s("stu-ele-5-01", "Vinod Kale",              "ELE", "BTECH-ELE", 5, "001", 88, "A"),
  s("stu-ele-5-02", "Sujata Kamble",           "ELE", "BTECH-ELE", 5, "002", 73, "B"),
  s("stu-ele-7-01", "Neha Reddy",              "ELE", "BTECH-ELE", 7, "001", 91, "A"),
  s("stu-ele-7-02", "Sunil Waghmare",          "ELE", "BTECH-ELE", 7, "002", 78, "A"),
  s("stu-ele-7-03", "Priya Mohite",            "ELE", "BTECH-ELE", 7, "003", 68, "B"),

  // -----------------------------------------------------------------------
  // CSEAIML — 6 students (mix of years)
  // -----------------------------------------------------------------------

  s("stu-aiml-3-01", "Janhavi Patil",          "CSEAIML", "BTECH-CSEAIML", 3, "001", 91, "A"),
  s("stu-aiml-3-02", "Omkar Shinde",           "CSEAIML", "BTECH-CSEAIML", 3, "002", 83, "B"),
  s("stu-aiml-5-01", "Tejas Nalawade",         "CSEAIML", "BTECH-CSEAIML", 5, "001", 87, "A"),
  s("stu-aiml-5-02", "Vaishnavi Ghodke",       "CSEAIML", "BTECH-CSEAIML", 5, "002", 70, "B"),
  s("stu-aiml-7-01", "Priya Saxena",           "CSEAIML", "BTECH-CSEAIML", 7, "001", 94, "A"),
  s("stu-aiml-7-02", "Manish Patel",           "CSEAIML", "BTECH-CSEAIML", 7, "002", 76, "A"),

  // -----------------------------------------------------------------------
  // CSEDS — 6 students (mix of years)
  // -----------------------------------------------------------------------

  s("stu-ds-3-01", "Archana Sawant",           "CSEDS", "BTECH-CSEDS", 3, "001", 85, "A"),
  s("stu-ds-3-02", "Chetan Sutar",             "CSEDS", "BTECH-CSEDS", 3, "002", 63, "B"),
  s("stu-ds-5-01", "Rohini Iyer",              "CSEDS", "BTECH-CSEDS", 5, "001", 92, "A"),
  s("stu-ds-5-02", "Yash Kulkarni",            "CSEDS", "BTECH-CSEDS", 5, "002", 78, "B"),
  s("stu-ds-7-01", "Siddharth Rao",            "CSEDS", "BTECH-CSEDS", 7, "001", 89, "A"),
  s("stu-ds-7-02", "Kritika Sharma",           "CSEDS", "BTECH-CSEDS", 7, "002", 81, "B"),

  // -----------------------------------------------------------------------
  // CSBS — 6 students (mix of years)
  // -----------------------------------------------------------------------

  s("stu-csbs-3-01", "Aditya Joshi",           "CSBS", "BTECH-CSBS", 3, "001", 79, "A"),
  s("stu-csbs-3-02", "Shraddha Pawar",         "CSBS", "BTECH-CSBS", 3, "002", 86, "B"),
  s("stu-csbs-5-01", "Kiran Bhosale",          "CSBS", "BTECH-CSBS", 5, "001", 69, "A"),
  s("stu-csbs-5-02", "Nisha Deshmukh",         "CSBS", "BTECH-CSBS", 5, "002", 92, "B"),
  s("stu-csbs-7-01", "Rajan Chougule",         "CSBS", "BTECH-CSBS", 7, "001", 75, "A"),
  s("stu-csbs-7-02", "Shweta Gaikwad",         "CSBS", "BTECH-CSBS", 7, "002", 88, "A"),

  // -----------------------------------------------------------------------
  // BIO — 6 students (mix of years)
  // -----------------------------------------------------------------------

  s("stu-bio-3-01", "Ankita Joshi",            "BIO", "BTECH-BIO", 3, "001", 84, "A"),
  s("stu-bio-3-02", "Rushikesh Patil",         "BIO", "BTECH-BIO", 3, "002", 61, "B"),
  s("stu-bio-5-01", "Ashwini Kulkarni",        "BIO", "BTECH-BIO", 5, "001", 90, "A"),
  s("stu-bio-5-02", "Vishal More",             "BIO", "BTECH-BIO", 5, "002", 73, "B"),
  s("stu-bio-7-01", "Pallavi Bhosale",         "BIO", "BTECH-BIO", 7, "001", 88, "A"),
  s("stu-bio-7-02", "Ravi Suryawanshi",        "BIO", "BTECH-BIO", 7, "002", 65, "B"),
];

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/** All students in a given department. */
export function getStudentsByDepartment(dept: string): KitStudentRecord[] {
  return KIT_STUDENTS_DATA.filter((s) => s.departmentCode === dept);
}

/** All students currently in a given semester (1, 3, 5, or 7). */
export function getStudentsBySemester(sem: number): KitStudentRecord[] {
  return KIT_STUDENTS_DATA.filter((s) => s.currentSemester === sem);
}

/**
 * Returns students eligible for the given exam cycle.
 * Eligibility: attendancePercentage >= 75.
 * cycleId is accepted for API-compat but currently all students are in the
 * single Odd-Semester 2026-27 cycle ("cycle-ese-2026").
 */
export function getStudentsForExamCycle(cycleId: string): KitStudentRecord[] {
  void cycleId; // reserved for future multi-cycle filtering
  return KIT_STUDENTS_DATA.filter((s) => s.attendancePercentage >= 75);
}
