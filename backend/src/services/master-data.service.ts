import { prisma } from "../db/prisma.js";
import {
  CreateFacultyInput,
  CreateStudentInput,
  CreateRoomInput,
  CreateSubjectInput,
} from "@nexora/contracts";
import { AuditService } from "./audit.service.js";

export interface FacultyItem {
  id: string;
  name: string;
  email: string;
  employeeCode: string;
  departmentCode: string;
  departmentName?: string;
  designation: string;
  maxDutiesPerWeek: number;
  createdAt: string;
}

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  departmentCode: string;
  currentSemester: number;
  attendancePercentage: number;
  status: string;
  createdAt: string;
}

export interface RoomItem {
  id: string;
  code: string;
  building: string;
  floor: number;
  capacity: number;
  isAccessible: boolean;
  hasProjector: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface SubjectItem {
  id: string;
  code: string;
  title: string;
  credits: number;
  departmentCode: string;
  createdAt: string;
}

// In-memory master stores with default datasets for instant reactivity and offline resilience
// KIT's College of Engineering, Kolhapur — seed data
const initialFaculty: FacultyItem[] = [
  // --- Benchmark / Standard Core Faculty (Required for test assertions) ---
  { id: "fac-core-1", name: "Dr. A. Sharma", email: "sharma@nexora.edu", employeeCode: "EMP-1082", departmentCode: "CSE", departmentName: "Computer Science & Engineering", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-core-2", name: "Prof. R. Iyer", email: "iyer@nexora.edu", employeeCode: "EMP-1083", departmentCode: "ECE", departmentName: "Electronics & Communication Engineering", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- CSE Department ---
  { id: "fac-1", name: "Prof. R. K. Mehta", email: "rkmehta@kit.edu", employeeCode: "KIT-1001", departmentCode: "CSE", departmentName: "Computer Science & Engineering", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-2", name: "Dr. Arvind Sharma", email: "arvind.sharma@kit.edu", employeeCode: "KIT-1002", departmentCode: "CSE", departmentName: "Computer Science & Engineering", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-3", name: "Prof. Rajesh Kulkarni", email: "rajesh.kulkarni@kit.edu", employeeCode: "KIT-1003", departmentCode: "CSE", departmentName: "Computer Science & Engineering", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-4", name: "Dr. Meenakshi Sundaram", email: "meenakshi.s@kit.edu", employeeCode: "KIT-1004", departmentCode: "CSE", departmentName: "Computer Science & Engineering", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-5", name: "Prof. Swati Desai", email: "swati.desai@kit.edu", employeeCode: "KIT-1005", departmentCode: "CSE", departmentName: "Computer Science & Engineering", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-6", name: "Dr. Pooja Shah", email: "pooja.shah@kit.edu", employeeCode: "KIT-1006", departmentCode: "CSE", departmentName: "Computer Science & Engineering", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- ETC Department ---
  { id: "fac-7", name: "Dr. M. Roy", email: "m.roy@kit.edu", employeeCode: "KIT-1007", departmentCode: "ETC", departmentName: "Electronics & Telecommunication", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-8", name: "Prof. Rohini Iyer", email: "rohini.iyer@kit.edu", employeeCode: "KIT-1008", departmentCode: "ETC", departmentName: "Electronics & Telecommunication", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-9", name: "Dr. Sneha Deshmukh", email: "sneha.deshmukh@kit.edu", employeeCode: "KIT-1009", departmentCode: "ETC", departmentName: "Electronics & Telecommunication", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-10", name: "Prof. Mahesh Pawar", email: "mahesh.pawar@kit.edu", employeeCode: "KIT-1010", departmentCode: "ETC", departmentName: "Electronics & Telecommunication", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- MECH Department ---
  { id: "fac-11", name: "Dr. Pramod Kulkarni", email: "pramod.kulkarni@kit.edu", employeeCode: "KIT-1011", departmentCode: "MECH", departmentName: "Mechanical Engineering", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-12", name: "Dr. Ramesh Patil", email: "ramesh.patil@kit.edu", employeeCode: "KIT-1012", departmentCode: "MECH", departmentName: "Mechanical Engineering", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-13", name: "Prof. Amit Kadam", email: "amit.kadam@kit.edu", employeeCode: "KIT-1013", departmentCode: "MECH", departmentName: "Mechanical Engineering", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-14", name: "Dr. Harish Salunkhe", email: "harish.salunkhe@kit.edu", employeeCode: "KIT-1014", departmentCode: "MECH", departmentName: "Mechanical Engineering", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- CVL Department ---
  { id: "fac-15", name: "Dr. S. Nair", email: "s.nair@kit.edu", employeeCode: "KIT-1015", departmentCode: "CVL", departmentName: "Civil Engineering", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-16", name: "Dr. S. K. Joshi", email: "sk.joshi@kit.edu", employeeCode: "KIT-1016", departmentCode: "CVL", departmentName: "Civil Engineering", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-17", name: "Prof. Nikhil Shinde", email: "nikhil.shinde@kit.edu", employeeCode: "KIT-1017", departmentCode: "CVL", departmentName: "Civil Engineering", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- BIO Department ---
  { id: "fac-18", name: "Dr. Anjali Patil", email: "anjali.patil@kit.edu", employeeCode: "KIT-1018", departmentCode: "BIO", departmentName: "Biotechnology", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-19", name: "Prof. Deepa Mane", email: "deepa.mane@kit.edu", employeeCode: "KIT-1019", departmentCode: "BIO", departmentName: "Biotechnology", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-20", name: "Dr. Radhika Kulkarni", email: "radhika.kulkarni@kit.edu", employeeCode: "KIT-1020", departmentCode: "BIO", departmentName: "Biotechnology", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- ELE Department ---
  { id: "fac-21", name: "Dr. A. Verma", email: "a.verma@kit.edu", employeeCode: "KIT-1021", departmentCode: "ELE", departmentName: "Electrical Engineering", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-22", name: "Prof. K. N. Rao", email: "kn.rao@kit.edu", employeeCode: "KIT-1022", departmentCode: "ELE", departmentName: "Electrical Engineering", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-23", name: "Prof. Shilpa Mane", email: "shilpa.mane@kit.edu", employeeCode: "KIT-1023", departmentCode: "ELE", departmentName: "Electrical Engineering", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- CSEAIML Department ---
  { id: "fac-24", name: "Dr. T. Banerjee", email: "t.banerjee@kit.edu", employeeCode: "KIT-1024", departmentCode: "CSEAIML", departmentName: "CSE (AI & Machine Learning)", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-25", name: "Prof. Neha Patil", email: "neha.patil@kit.edu", employeeCode: "KIT-1025", departmentCode: "CSEAIML", departmentName: "CSE (AI & Machine Learning)", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-26", name: "Dr. Nilesh Kulkarni", email: "nilesh.kulkarni@kit.edu", employeeCode: "KIT-1026", departmentCode: "CSEAIML", departmentName: "CSE (AI & Machine Learning)", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- CSEDS Department ---
  { id: "fac-27", name: "Dr. Vikram Joshi", email: "vikram.joshi@kit.edu", employeeCode: "KIT-1027", departmentCode: "CSEDS", departmentName: "CSE (Data Science)", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-28", name: "Dr. Vinay More", email: "vinay.more@kit.edu", employeeCode: "KIT-1028", departmentCode: "CSEDS", departmentName: "CSE (Data Science)", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  { id: "fac-29", name: "Prof. Varsha Kamble", email: "varsha.kamble@kit.edu", employeeCode: "KIT-1029", departmentCode: "CSEDS", departmentName: "CSE (Data Science)", designation: "Assistant Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- CSBS Department ---
  { id: "fac-30", name: "Dr. Suresh Kulkarni", email: "suresh.kulkarni@kit.edu", employeeCode: "KIT-1030", departmentCode: "CSBS", departmentName: "Computer Science & Business Systems", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-31", name: "Prof. Sunita Gaikwad", email: "sunita.gaikwad@kit.edu", employeeCode: "KIT-1031", departmentCode: "CSBS", departmentName: "Computer Science & Business Systems", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
  // --- CVL & ENV Department ---
  { id: "fac-32", name: "Dr. R. V. Kulkarni", email: "rv.kulkarni@kit.edu", employeeCode: "KIT-1032", departmentCode: "CVL & ENV", departmentName: "Civil and Environmental Engineering", designation: "Professor & HOD", maxDutiesPerWeek: 2, createdAt: new Date().toISOString() },
  { id: "fac-33", name: "Dr. Ajay Chougule", email: "ajay.chougule@kit.edu", employeeCode: "KIT-1033", departmentCode: "CVL & ENV", departmentName: "Civil and Environmental Engineering", designation: "Associate Professor", maxDutiesPerWeek: 3, createdAt: new Date().toISOString() },
];

const initialStudents: StudentItem[] = [
  // --- Benchmark / Standard Core Student (Required for test assertions) ---
  { id: "stu-core-1", name: "Aarav Sharma", email: "aarav.sharma@nexora.edu", rollNumber: "CS2023-042", departmentCode: "CSE", currentSemester: 7, attendancePercentage: 88.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- CSE: Sem 1 (First Year) ---
  { id: "stu-cse-1-1", name: "Aditya Kulkarni", email: "aditya.kulkarni@kit.edu", rollNumber: "CSE2026001", departmentCode: "CSE", currentSemester: 1, attendancePercentage: 92.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cse-1-2", name: "Priya Deshmukh", email: "priya.deshmukh@kit.edu", rollNumber: "CSE2026002", departmentCode: "CSE", currentSemester: 1, attendancePercentage: 85.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cse-1-3", name: "Rohan Patil", email: "rohan.patil@kit.edu", rollNumber: "CSE2026003", departmentCode: "CSE", currentSemester: 1, attendancePercentage: 70.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- CSE: Sem 3 (Second Year) ---
  { id: "stu-cse-3-1", name: "Sakshi Mane", email: "sakshi.mane@kit.edu", rollNumber: "CSE2025001", departmentCode: "CSE", currentSemester: 3, attendancePercentage: 88.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cse-3-2", name: "Nikhil Shinde", email: "nikhil.shinde@kit.edu", rollNumber: "CSE2025002", departmentCode: "CSE", currentSemester: 3, attendancePercentage: 72.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cse-3-3", name: "Anjali More", email: "anjali.more@kit.edu", rollNumber: "CSE2025003", departmentCode: "CSE", currentSemester: 3, attendancePercentage: 65.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- CSE: Sem 5 (Third Year) ---
  { id: "stu-cse-5-1", name: "Rahul Jadhav", email: "rahul.jadhav@kit.edu", rollNumber: "CSE2024001", departmentCode: "CSE", currentSemester: 5, attendancePercentage: 91.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cse-5-2", name: "Sneha Kamble", email: "sneha.kamble@kit.edu", rollNumber: "CSE2024002", departmentCode: "CSE", currentSemester: 5, attendancePercentage: 79.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cse-5-3", name: "Amit Chavan", email: "amit.chavan@kit.edu", rollNumber: "CSE2024003", departmentCode: "CSE", currentSemester: 5, attendancePercentage: 60.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- CSE: Sem 7 (Final Year) ---
  { id: "stu-cse-7-1", name: "Aarav Sharma", email: "aarav.sharma@kit.edu", rollNumber: "CSE2023001", departmentCode: "CSE", currentSemester: 7, attendancePercentage: 88.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cse-7-2", name: "Neha Patel", email: "neha.patel@kit.edu", rollNumber: "CSE2023002", departmentCode: "CSE", currentSemester: 7, attendancePercentage: 69.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cse-7-3", name: "Rohan Verma", email: "rohan.verma@kit.edu", rollNumber: "CSE2023003", departmentCode: "CSE", currentSemester: 7, attendancePercentage: 62.4, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- ETC: Sem 1 & 3 & 5 & 7 ---
  { id: "stu-etc-1-1", name: "Deepak Salunkhe", email: "deepak.salunkhe@kit.edu", rollNumber: "ETC2026001", departmentCode: "ETC", currentSemester: 1, attendancePercentage: 87.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-etc-3-1", name: "Pooja Bhosale", email: "pooja.bhosale@kit.edu", rollNumber: "ETC2025001", departmentCode: "ETC", currentSemester: 3, attendancePercentage: 82.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-etc-3-2", name: "Vishal Doke", email: "vishal.doke@kit.edu", rollNumber: "ETC2025002", departmentCode: "ETC", currentSemester: 3, attendancePercentage: 68.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-etc-5-1", name: "Gaurav Thorat", email: "gaurav.thorat@kit.edu", rollNumber: "ETC2024001", departmentCode: "ETC", currentSemester: 5, attendancePercentage: 90.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-etc-7-1", name: "Ananya Deshmukh", email: "ananya.deshmukh@kit.edu", rollNumber: "ETC2023001", departmentCode: "ETC", currentSemester: 7, attendancePercentage: 91.2, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-etc-7-2", name: "Swapnil Kale", email: "swapnil.kale@kit.edu", rollNumber: "ETC2023002", departmentCode: "ETC", currentSemester: 7, attendancePercentage: 74.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- MECH: Sem 1 & 3 & 5 & 7 ---
  { id: "stu-mech-1-1", name: "Suraj Jadhav", email: "suraj.jadhav@kit.edu", rollNumber: "MECH2026001", departmentCode: "MECH", currentSemester: 1, attendancePercentage: 83.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-mech-3-1", name: "Kiran Pawar", email: "kiran.pawar@kit.edu", rollNumber: "MECH2025001", departmentCode: "MECH", currentSemester: 3, attendancePercentage: 76.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-mech-5-1", name: "Ravi Mohite", email: "ravi.mohite@kit.edu", rollNumber: "MECH2024001", departmentCode: "MECH", currentSemester: 5, attendancePercentage: 85.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-mech-5-2", name: "Tanvi Gaikwad", email: "tanvi.gaikwad@kit.edu", rollNumber: "MECH2024002", departmentCode: "MECH", currentSemester: 5, attendancePercentage: 61.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-mech-7-1", name: "Vikram Das", email: "vikram.das@kit.edu", rollNumber: "MECH2023001", departmentCode: "MECH", currentSemester: 7, attendancePercentage: 78.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-mech-7-2", name: "Pratik Nale", email: "pratik.nale@kit.edu", rollNumber: "MECH2023002", departmentCode: "MECH", currentSemester: 7, attendancePercentage: 92.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- CVL: Sem 3 & 7 ---
  { id: "stu-cvl-3-1", name: "Ashwini Kadam", email: "ashwini.kadam@kit.edu", rollNumber: "CVL2025001", departmentCode: "CVL", currentSemester: 3, attendancePercentage: 80.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cvl-5-1", name: "Mahesh Surve", email: "mahesh.surve@kit.edu", rollNumber: "CVL2024001", departmentCode: "CVL", currentSemester: 5, attendancePercentage: 88.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cvl-7-1", name: "Tejas Shirke", email: "tejas.shirke@kit.edu", rollNumber: "CVL2023001", departmentCode: "CVL", currentSemester: 7, attendancePercentage: 76.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-cvl-7-2", name: "Rutuja Powar", email: "rutuja.powar@kit.edu", rollNumber: "CVL2023002", departmentCode: "CVL", currentSemester: 7, attendancePercentage: 58.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- BIO: Sem 3 & 5 & 7 ---
  { id: "stu-bio-3-1", name: "Pallavi Bhosale", email: "pallavi.bhosale@kit.edu", rollNumber: "BIO2025001", departmentCode: "BIO", currentSemester: 3, attendancePercentage: 93.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-bio-5-1", name: "Siddharth Joshi", email: "siddharth.joshi@kit.edu", rollNumber: "BIO2024001", departmentCode: "BIO", currentSemester: 5, attendancePercentage: 81.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-bio-7-1", name: "Nisha Kulkarni", email: "nisha.kulkarni@kit.edu", rollNumber: "BIO2023001", departmentCode: "BIO", currentSemester: 7, attendancePercentage: 87.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-bio-7-2", name: "Prachi Shende", email: "prachi.shende@kit.edu", rollNumber: "BIO2023002", departmentCode: "BIO", currentSemester: 7, attendancePercentage: 63.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- ELE: Sem 3 & 5 & 7 ---
  { id: "stu-ele-3-1", name: "Mangesh Chougule", email: "mangesh.chougule@kit.edu", rollNumber: "ELE2025001", departmentCode: "ELE", currentSemester: 3, attendancePercentage: 79.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-ele-5-1", name: "Vaibhav Pawar", email: "vaibhav.pawar@kit.edu", rollNumber: "ELE2024001", departmentCode: "ELE", currentSemester: 5, attendancePercentage: 86.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-ele-7-1", name: "Supriya Mane", email: "supriya.mane@kit.edu", rollNumber: "ELE2023001", departmentCode: "ELE", currentSemester: 7, attendancePercentage: 90.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-ele-7-2", name: "Ajinkya Rane", email: "ajinkya.rane@kit.edu", rollNumber: "ELE2023002", departmentCode: "ELE", currentSemester: 7, attendancePercentage: 67.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- CSEAIML: Sem 3 & 5 & 7 ---
  { id: "stu-aiml-3-1", name: "Rohit Sharma", email: "rohit.sharma@kit.edu", rollNumber: "CSEAIML2025001", departmentCode: "CSEAIML", currentSemester: 3, attendancePercentage: 95.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-aiml-5-1", name: "Kavya Deshpande", email: "kavya.deshpande@kit.edu", rollNumber: "CSEAIML2024001", departmentCode: "CSEAIML", currentSemester: 5, attendancePercentage: 82.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-aiml-7-1", name: "Sandeep Chavan", email: "sandeep.chavan@kit.edu", rollNumber: "CSEAIML2023001", departmentCode: "CSEAIML", currentSemester: 7, attendancePercentage: 77.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-aiml-7-2", name: "Laxmi Bagde", email: "laxmi.bagde@kit.edu", rollNumber: "CSEAIML2023002", departmentCode: "CSEAIML", currentSemester: 7, attendancePercentage: 56.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- CSEDS: Sem 3 & 5 & 7 ---
  { id: "stu-ds-3-1", name: "Amol Kamble", email: "amol.kamble@kit.edu", rollNumber: "CSEDS2025001", departmentCode: "CSEDS", currentSemester: 3, attendancePercentage: 84.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-ds-5-1", name: "Vidya Powar", email: "vidya.powar@kit.edu", rollNumber: "CSEDS2024001", departmentCode: "CSEDS", currentSemester: 5, attendancePercentage: 89.5, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-ds-7-1", name: "Raj Nitin Magdum", email: "raj.magdum@kit.edu", rollNumber: "CSEDS2023001", departmentCode: "CSEDS", currentSemester: 7, attendancePercentage: 75.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-ds-7-2", name: "Chetan Shinde", email: "chetan.shinde@kit.edu", rollNumber: "CSEDS2023002", departmentCode: "CSEDS", currentSemester: 7, attendancePercentage: 61.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  // --- CSBS: Sem 3 & 5 & 7 ---
  { id: "stu-csbs-3-1", name: "Rahul Jagtap", email: "rahul.jagtap@kit.edu", rollNumber: "CSBS2025001", departmentCode: "CSBS", currentSemester: 3, attendancePercentage: 86.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-csbs-5-1", name: "Meghana Sawant", email: "meghana.sawant@kit.edu", rollNumber: "CSBS2024001", departmentCode: "CSBS", currentSemester: 5, attendancePercentage: 78.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-csbs-7-1", name: "Pranav Kulkarni", email: "pranav.kulkarni@kit.edu", rollNumber: "CSBS2023001", departmentCode: "CSBS", currentSemester: 7, attendancePercentage: 83.0, status: "ACTIVE", createdAt: new Date().toISOString() },
  { id: "stu-csbs-7-2", name: "Riya Desai", email: "riya.desai@kit.edu", rollNumber: "CSBS2023002", departmentCode: "CSBS", currentSemester: 7, attendancePercentage: 59.5, status: "ACTIVE", createdAt: new Date().toISOString() },
];

const initialRooms: RoomItem[] = [
  {
    id: "room-1",
    code: "HALL-A101",
    building: "Main Academic Block",
    floor: 1,
    capacity: 150,
    isAccessible: true,
    hasProjector: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "room-2",
    code: "HALL-B204",
    building: "Science & Tech Wing",
    floor: 2,
    capacity: 100,
    isAccessible: true,
    hasProjector: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "room-3",
    code: "HALL-C301",
    building: "Engineering Block",
    floor: 3,
    capacity: 90,
    isAccessible: false,
    hasProjector: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "room-4",
    code: "SEM-01",
    building: "Annex Block",
    floor: 1,
    capacity: 40,
    isAccessible: true,
    hasProjector: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const initialSubjects: SubjectItem[] = [
  {
    id: "sub-1",
    code: "CS701",
    title: "Distributed Systems & Cloud Computing",
    credits: 4,
    departmentCode: "CSE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sub-2",
    code: "EC702",
    title: "VLSI Architecture & Embedded Logic",
    credits: 4,
    departmentCode: "ECE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sub-3",
    code: "ME703",
    title: "Finite Element Methods & Dynamics",
    credits: 4,
    departmentCode: "MECH",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sub-4",
    code: "CS704",
    title: "Cryptography & Network Security",
    credits: 3,
    departmentCode: "CSE",
    createdAt: new Date().toISOString(),
  },
];

const facultyStore = new Map<string, FacultyItem>(initialFaculty.map((f) => [f.id, f]));
const studentStore = new Map<string, StudentItem>(initialStudents.map((s) => [s.id, s]));
const roomStore = new Map<string, RoomItem>(initialRooms.map((r) => [r.id, r]));
const subjectStore = new Map<string, SubjectItem>(initialSubjects.map((s) => [s.id, s]));

export class MasterDataService {
  // ==========================================
  // FACULTY (TEACHERS)
  // ==========================================

  public static async listFaculty(): Promise<FacultyItem[]> {
    return Array.from(facultyStore.values());
  }

  public static async createFaculty(
    input: CreateFacultyInput,
    actorId?: string,
    correlationId = "master-fac"
  ): Promise<FacultyItem> {
    // Check uniqueness of employeeCode and email
    for (const f of facultyStore.values()) {
      if (f.employeeCode.toLowerCase() === input.employeeCode.toLowerCase()) {
        const err: any = new Error(`Faculty employee code '${input.employeeCode}' already exists.`);
        err.code = "DUPLICATE_EMPLOYEE_CODE";
        err.status = 409;
        throw err;
      }
      if (f.email.toLowerCase() === input.email.toLowerCase()) {
        const err: any = new Error(`Faculty email '${input.email}' is already registered.`);
        err.code = "DUPLICATE_EMAIL";
        err.status = 409;
        throw err;
      }
    }

    const id = `fac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: FacultyItem = {
      id,
      name: input.name,
      email: input.email,
      employeeCode: input.employeeCode.toUpperCase(),
      departmentCode: input.departmentCode.toUpperCase(),
      designation: input.designation || "Assistant Professor",
      maxDutiesPerWeek: input.maxDutiesPerWeek || 3,
      createdAt: new Date().toISOString(),
    };

    facultyStore.set(id, newItem);

    AuditService.log({
      actorId,
      action: "FACULTY_CREATED",
      entityType: "Faculty",
      entityId: id,
      correlationId,
      payload: newItem,
    }).catch(() => {});

    return newItem;
  }

  public static async deleteFaculty(id: string, actorId?: string): Promise<boolean> {
    const existing = facultyStore.get(id);
    if (!existing) {
      const err: any = new Error(`Faculty member '${id}' not found.`);
      err.code = "NOT_FOUND";
      err.status = 404;
      throw err;
    }

    facultyStore.delete(id);
    AuditService.log({
      actorId,
      action: "FACULTY_DELETED",
      entityType: "Faculty",
      entityId: id,
      correlationId: `del-fac-${Date.now()}`,
      payload: existing,
    }).catch(() => {});

    return true;
  }

  // ==========================================
  // STUDENTS
  // ==========================================

  public static async listStudents(): Promise<StudentItem[]> {
    return Array.from(studentStore.values());
  }

  public static async createStudent(
    input: CreateStudentInput,
    actorId?: string,
    correlationId = "master-stu"
  ): Promise<StudentItem> {
    for (const s of studentStore.values()) {
      if (s.rollNumber.toLowerCase() === input.rollNumber.toLowerCase()) {
        const err: any = new Error(`Student roll number '${input.rollNumber}' already exists.`);
        err.code = "DUPLICATE_ROLL_NUMBER";
        err.status = 409;
        throw err;
      }
    }

    const id = `stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: StudentItem = {
      id,
      name: input.name,
      email: input.email,
      rollNumber: input.rollNumber.toUpperCase(),
      departmentCode: input.departmentCode.toUpperCase(),
      currentSemester: input.currentSemester || 1,
      attendancePercentage: input.attendancePercentage ?? 85.0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    studentStore.set(id, newItem);

    AuditService.log({
      actorId,
      action: "STUDENT_CREATED",
      entityType: "Student",
      entityId: id,
      correlationId,
      payload: newItem,
    }).catch(() => {});

    return newItem;
  }

  public static async deleteStudent(id: string, actorId?: string): Promise<boolean> {
    const existing = studentStore.get(id);
    if (!existing) {
      const err: any = new Error(`Student '${id}' not found.`);
      err.code = "NOT_FOUND";
      err.status = 404;
      throw err;
    }

    studentStore.delete(id);
    AuditService.log({
      actorId,
      action: "STUDENT_DELETED",
      entityType: "Student",
      entityId: id,
      correlationId: `del-stu-${Date.now()}`,
      payload: existing,
    }).catch(() => {});

    return true;
  }

  // ==========================================
  // ROOMS & BLOCKS (EXAMINATION HALLS)
  // ==========================================

  public static async listRooms(): Promise<RoomItem[]> {
    return Array.from(roomStore.values());
  }

  public static async createRoom(
    input: CreateRoomInput,
    actorId?: string,
    correlationId = "master-room"
  ): Promise<RoomItem> {
    for (const r of roomStore.values()) {
      if (r.code.toLowerCase() === input.code.toLowerCase()) {
        const err: any = new Error(`Room code '${input.code}' already exists.`);
        err.code = "DUPLICATE_ROOM_CODE";
        err.status = 409;
        throw err;
      }
    }

    const id = `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: RoomItem = {
      id,
      code: input.code.toUpperCase(),
      building: input.building,
      floor: input.floor || 1,
      capacity: input.capacity,
      isAccessible: input.isAccessible ?? true,
      hasProjector: input.hasProjector ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    roomStore.set(id, newItem);

    AuditService.log({
      actorId,
      action: "ROOM_CREATED",
      entityType: "Room",
      entityId: id,
      correlationId,
      payload: newItem,
    }).catch(() => {});

    return newItem;
  }

  public static async deleteRoom(id: string, actorId?: string): Promise<boolean> {
    const existing = roomStore.get(id);
    if (!existing) {
      const err: any = new Error(`Room '${id}' not found.`);
      err.code = "NOT_FOUND";
      err.status = 404;
      throw err;
    }

    roomStore.delete(id);
    AuditService.log({
      actorId,
      action: "ROOM_DELETED",
      entityType: "Room",
      entityId: id,
      correlationId: `del-room-${Date.now()}`,
      payload: existing,
    }).catch(() => {});

    return true;
  }

  // ==========================================
  // SUBJECTS & COURSES
  // ==========================================

  public static async listSubjects(): Promise<SubjectItem[]> {
    return Array.from(subjectStore.values());
  }

  public static async createSubject(
    input: CreateSubjectInput,
    actorId?: string,
    correlationId = "master-sub"
  ): Promise<SubjectItem> {
    for (const s of subjectStore.values()) {
      if (s.code.toLowerCase() === input.code.toLowerCase()) {
        const err: any = new Error(`Subject code '${input.code}' already exists.`);
        err.code = "DUPLICATE_SUBJECT_CODE";
        err.status = 409;
        throw err;
      }
    }

    const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: SubjectItem = {
      id,
      code: input.code.toUpperCase(),
      title: input.title,
      credits: input.credits || 3,
      departmentCode: input.departmentCode.toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    subjectStore.set(id, newItem);

    AuditService.log({
      actorId,
      action: "SUBJECT_CREATED",
      entityType: "Subject",
      entityId: id,
      correlationId,
      payload: newItem,
    }).catch(() => {});

    return newItem;
  }

  public static async deleteSubject(id: string, actorId?: string): Promise<boolean> {
    const existing = subjectStore.get(id);
    if (!existing) {
      const err: any = new Error(`Subject '${id}' not found.`);
      err.code = "NOT_FOUND";
      err.status = 404;
      throw err;
    }

    subjectStore.delete(id);
    return true;
  }

  /**
   * Reset store to initial state for isolated test runs.
   */
  public static resetStore(): void {
    facultyStore.clear();
    initialFaculty.forEach((f) => facultyStore.set(f.id, f));

    studentStore.clear();
    initialStudents.forEach((s) => studentStore.set(s.id, s));

    roomStore.clear();
    initialRooms.forEach((r) => roomStore.set(r.id, r));

    subjectStore.clear();
    initialSubjects.forEach((s) => subjectStore.set(s.id, s));
  }
}
