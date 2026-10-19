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
const initialFaculty: FacultyItem[] = [
  {
    id: "fac-1",
    name: "Dr. A. Sharma",
    email: "sharma@nexora.edu",
    employeeCode: "EMP-1082",
    departmentCode: "CSE",
    departmentName: "Computer Science & Engineering",
    designation: "Associate Professor",
    maxDutiesPerWeek: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fac-2",
    name: "Prof. R. Iyer",
    email: "iyer@nexora.edu",
    employeeCode: "EMP-1083",
    departmentCode: "ECE",
    departmentName: "Electronics & Communication Engineering",
    designation: "Assistant Professor",
    maxDutiesPerWeek: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fac-3",
    name: "Dr. P. Kulkarni",
    email: "kulkarni@nexora.edu",
    employeeCode: "EMP-1084",
    departmentCode: "MECH",
    departmentName: "Mechanical Engineering",
    designation: "Professor & HOD",
    maxDutiesPerWeek: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fac-4",
    name: "Prof. S. Patil",
    email: "patil@nexora.edu",
    employeeCode: "EMP-1085",
    departmentCode: "CSE",
    departmentName: "Computer Science & Engineering",
    designation: "Assistant Professor",
    maxDutiesPerWeek: 3,
    createdAt: new Date().toISOString(),
  },
];

const initialStudents: StudentItem[] = [
  {
    id: "stu-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@nexora.edu",
    rollNumber: "CS2023-042",
    departmentCode: "CSE",
    currentSemester: 7,
    attendancePercentage: 88.5,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "stu-2",
    name: "Neha Patel",
    email: "neha.patel@nexora.edu",
    rollNumber: "CS2023-055",
    departmentCode: "CSE",
    currentSemester: 7,
    attendancePercentage: 69.0,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "stu-3",
    name: "Rohan Verma",
    email: "rohan.verma@nexora.edu",
    rollNumber: "CS2023-088",
    departmentCode: "CSE",
    currentSemester: 7,
    attendancePercentage: 62.4,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "stu-4",
    name: "Ananya Deshmukh",
    email: "ananya.d@nexora.edu",
    rollNumber: "EC2023-015",
    departmentCode: "ECE",
    currentSemester: 7,
    attendancePercentage: 91.2,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "stu-5",
    name: "Vikram Das",
    email: "vikram.das@nexora.edu",
    rollNumber: "ME2023-009",
    departmentCode: "MECH",
    currentSemester: 7,
    attendancePercentage: 78.0,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
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
