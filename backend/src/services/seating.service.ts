import { prisma } from "../db/prisma.js";
import { AuditService } from "./audit.service.js";

export interface StudentSeatAssignment {
  studentId: string;
  studentName?: string;
  rollNumber: string;
  examOfferingId: string;
  roomId: string;
  roomCode: string;
  seatLabel: string; // e.g. "R1-S01", "R1-S02"
}

export interface RoomSeatingMatrix {
  scheduledExamId: string;
  roomId: string;
  roomCode: string;
  building: string;
  capacity: number;
  allocatedCount: number;
  utilizationPercentage: number;
  allocations: StudentSeatAssignment[];
}

// In-memory seating allocation store for testing & offline database mode
const mockSeatingAllocations = new Map<string, StudentSeatAssignment[]>(); // scheduledExamId -> assignments

export class SeatingService {
  /**
   * Generates systematic checkerboard/spaced seat labels (e.g., Row 1 Seat 1 to Row N Seat M)
   */
  public static generateSeatLabels(capacity: number, seatsPerRow = 10): string[] {
    const labels: string[] = [];
    const totalRows = Math.ceil(capacity / seatsPerRow);

    for (let r = 1; r <= totalRows; r++) {
      const rowChar = String.fromCharCode(64 + r); // A, B, C...
      for (let s = 1; s <= seatsPerRow; s++) {
        if (labels.length < capacity) {
          labels.push(`${rowChar}-${s.toString().padStart(2, "0")}`);
        }
      }
    }
    return labels;
  }

  /**
   * Allocates seats for students sitting for an exam in a designated room.
   * Strictly enforces:
   * 1. Room capacity is not exceeded.
   * 2. No duplicate seat labels assigned.
   * 3. No student assigned to more than one seat.
   */
  public static allocateSeats(input: {
    scheduledExamId: string;
    roomId: string;
    roomCode: string;
    capacity: number;
    students: Array<{
      studentId: string;
      studentName?: string;
      rollNumber: string;
      examOfferingId: string;
    }>;
    seatsPerRow?: number;
    actorId?: string;
    correlationId?: string;
  }): RoomSeatingMatrix {
    const { scheduledExamId, roomId, roomCode, capacity, students } = input;

    if (students.length > capacity) {
      const err: any = new Error(
        `Physical room capacity exceeded: Room ${roomCode} has capacity ${capacity}, but ${students.length} students are assigned.`
      );
      err.code = "ROOM_CAPACITY_EXCEEDED";
      err.status = 422;
      throw err;
    }

    // Check for duplicate students in the input
    const studentSet = new Set<string>();
    for (const s of students) {
      if (studentSet.has(s.studentId)) {
        const err: any = new Error(`Duplicate student in seating roster: Student ${s.studentId} appears multiple times.`);
        err.code = "DUPLICATE_STUDENT_ALLOCATION";
        err.status = 422;
        throw err;
      }
      studentSet.add(s.studentId);
    }

    const availableLabels = this.generateSeatLabels(capacity, input.seatsPerRow || 10);
    const allocations: StudentSeatAssignment[] = [];

    // Sort students deterministically by roll number for clean sequential examination seating
    const sortedStudents = [...students].sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

    for (let i = 0; i < sortedStudents.length; i++) {
      const s = sortedStudents[i];
      const seatLabel = availableLabels[i];

      allocations.push({
        studentId: s.studentId,
        studentName: s.studentName,
        rollNumber: s.rollNumber,
        examOfferingId: s.examOfferingId,
        roomId,
        roomCode,
        seatLabel,
      });
    }

    mockSeatingAllocations.set(scheduledExamId, allocations);

    AuditService.log({
      actorId: input.actorId,
      action: "ROOM_SEATS_ALLOCATED",
      entityType: "ScheduledExam",
      entityId: scheduledExamId,
      correlationId: input.correlationId || "seat-corr",
      payload: {
        roomId,
        roomCode,
        capacity,
        allocatedCount: allocations.length,
      },
    }).catch(() => {});

    return {
      scheduledExamId,
      roomId,
      roomCode,
      building: "Academic Block",
      capacity,
      allocatedCount: allocations.length,
      utilizationPercentage: Math.round((allocations.length / capacity) * 1000) / 10,
      allocations,
    };
  }

  /**
   * Retrieves seating matrix for a scheduled exam hall.
   */
  public static getSeatingMatrix(scheduledExamId: string): RoomSeatingMatrix | null {
    const allocations = mockSeatingAllocations.get(scheduledExamId);
    if (!allocations) return null;

    return {
      scheduledExamId,
      roomId: allocations[0]?.roomId || "unknown",
      roomCode: allocations[0]?.roomCode || "unknown",
      building: "Academic Block",
      capacity: 50,
      allocatedCount: allocations.length,
      utilizationPercentage: Math.round((allocations.length / 50) * 1000) / 10,
      allocations,
    };
  }

  /**
   * Retrieves seat lookup for a student across all exam sessions.
   */
  public static getStudentSeats(studentId: string): StudentSeatAssignment[] {
    const results: StudentSeatAssignment[] = [];
    for (const allocList of mockSeatingAllocations.values()) {
      for (const a of allocList) {
        if (a.studentId === studentId) {
          results.push(a);
        }
      }
    }
    return results;
  }

  /**
   * Generates door-posting attendance and seating list in CSV format.
   */
  public static exportSeatingChartCsv(scheduledExamId: string): string {
    const matrix = this.getSeatingMatrix(scheduledExamId);
    if (!matrix) return "Seat Label,Roll Number,Student Name,Room\n";

    let csv = "Seat Label,Roll Number,Student Name,Room\n";
    for (const a of matrix.allocations) {
      csv += `"${a.seatLabel}","${a.rollNumber}","${a.studentName || ""}","${a.roomCode}"\n`;
    }
    return csv;
  }

  /**
   * Clear in-memory seating store for test isolation.
   */
  public static clearStore(): void {
    mockSeatingAllocations.clear();
  }
}
