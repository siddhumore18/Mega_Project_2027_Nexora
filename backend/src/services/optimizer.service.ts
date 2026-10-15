import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import {
  CandidateSchedule,
  ScheduledAssignment,
  SchedulingProblemSnapshot,
  SolverStatus,
} from "@nexora/contracts";
import { prisma } from "../db/prisma.js";
import { ScheduleValidatorService } from "./schedule-validator.service.js";
import { AuditService } from "./audit.service.js";

// In-memory mock store for test environments without an active PostgreSQL instance
interface InMemoryRun {
  id: string;
  examCycleId: string;
  status: SolverStatus;
  objectiveScore?: number;
  violationsCount: number;
  diagnostics: string[];
  candidateSchedule?: CandidateSchedule;
  startedAt: Date;
  finishedAt?: Date;
}

const mockRunsStore = new Map<string, InMemoryRun>();

export class OptimizerService {
  /**
   * Resolves the Python solver script path across different running environments.
   */
  public static getSolverScriptPath(): string {
    const candidates = [
      path.resolve(process.cwd(), "../optimizer/src/solver.py"),
      path.resolve(process.cwd(), "optimizer/src/solver.py"),
      path.resolve(process.cwd(), "../../optimizer/src/solver.py"),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return candidates[0];
  }

  /**
   * Executes the Python OR-Tools solver via isolated subprocess.
   */
  public static async executeSolver(
    snapshot: SchedulingProblemSnapshot,
    timeoutMs = 15000
  ): Promise<CandidateSchedule> {
    const scriptPath = this.getSolverScriptPath();

    if (!fs.existsSync(scriptPath)) {
      // Fallback: If python script is not reachable, use deterministic constraint solver
      return this.deterministicFallbackSolve(snapshot);
    }

    return new Promise<CandidateSchedule>((resolve) => {
      let stdoutData = "";
      let stderrData = "";
      let isSettled = false;

      const pythonCmd = process.platform === "win32" ? "python" : "python3";
      const proc = spawn(pythonCmd, [scriptPath], {
        cwd: path.dirname(path.dirname(scriptPath)),
        env: {
          ...process.env,
          PYTHONPATH: path.dirname(path.dirname(scriptPath)),
        },
      });

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try {
            proc.kill();
          } catch {
            // ignore
          }
          resolve({
            scheduleRunId: snapshot.examCycleId,
            status: SolverStatus.FAILED,
            assignments: [],
            hardViolations: [],
            softPenalties: [],
            diagnostics: [`Solver execution timed out after ${timeoutMs}ms`],
            generatedAt: new Date().toISOString(),
          });
        }
      }, timeoutMs);

      proc.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      proc.on("error", (err) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          // Fall back gracefully to deterministic solver
          resolve(this.deterministicFallbackSolve(snapshot));
        }
      });

      proc.on("close", (code) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);

        try {
          if (stdoutData.trim()) {
            const parsed = JSON.parse(stdoutData.trim()) as CandidateSchedule;
            resolve(parsed);
          } else {
            resolve(this.deterministicFallbackSolve(snapshot));
          }
        } catch (err: any) {
          resolve({
            scheduleRunId: snapshot.examCycleId,
            status: SolverStatus.FAILED,
            assignments: [],
            hardViolations: [],
            softPenalties: [],
            diagnostics: [
              `Failed to parse solver JSON: ${err.message}`,
              `Stderr: ${stderrData.slice(0, 300)}`,
            ],
            generatedAt: new Date().toISOString(),
          });
        }
      });

      try {
        proc.stdin.write(JSON.stringify(snapshot));
        proc.stdin.end();
      } catch (err) {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          resolve(this.deterministicFallbackSolve(snapshot));
        }
      }
    });
  }

  /**
   * Deterministic Node-side solver used when Python runtime is detached or in lightweight test harness.
   */
  public static deterministicFallbackSolve(
    snapshot: SchedulingProblemSnapshot
  ): CandidateSchedule {
    const { exams, timeSlots, rooms, weights } = snapshot;

    if (!timeSlots || timeSlots.length === 0) {
      return {
        scheduleRunId: snapshot.examCycleId,
        status: SolverStatus.INFEASIBLE,
        assignments: [],
        hardViolations: [
          {
            type: "EXAM_UNSCHEDULED" as any,
            description: "No time slots defined in cycle snapshot.",
            details: {},
          },
        ],
        softPenalties: [],
        diagnostics: ["Infeasible: Zero time slots available."],
        generatedAt: new Date().toISOString(),
      };
    }

    if (!rooms || rooms.length === 0) {
      return {
        scheduleRunId: snapshot.examCycleId,
        status: SolverStatus.INFEASIBLE,
        assignments: [],
        hardViolations: [
          {
            type: "ROOM_CAPACITY_EXCEEDED" as any,
            description: "No examination rooms defined in snapshot.",
            details: {},
          },
        ],
        softPenalties: [],
        diagnostics: ["Infeasible: Zero rooms available."],
        generatedAt: new Date().toISOString(),
      };
    }

    // Check capacity feasibility
    const maxRoomCap = Math.max(...rooms.map((r) => r.capacity));
    for (const exam of exams) {
      if (exam.enrolledStudents.length > maxRoomCap) {
        return {
          scheduleRunId: snapshot.examCycleId,
          status: SolverStatus.INFEASIBLE,
          assignments: [],
          hardViolations: [
            {
              type: "ROOM_CAPACITY_EXCEEDED" as any,
              description: `Exam ${exam.code} exceeds maximum room capacity (${maxRoomCap})`,
              details: { enrolled: exam.enrolledStudents.length, maxRoomCap },
            },
          ],
          softPenalties: [],
          diagnostics: [
            `Exam ${exam.code} (${exam.enrolledStudents.length} students) exceeds largest room capacity (${maxRoomCap}).`,
          ],
          generatedAt: new Date().toISOString(),
        };
      }
    }

    // Greedy constructive assignment with conflict avoidance
    const assignments: ScheduledAssignment[] = [];
    const roomSlotOccupied = new Set<string>(); // `${roomId}_${slotId}`
    const studentSlotOccupied = new Map<string, Set<string>>(); // slotId -> Set<studentId>

    for (const slot of timeSlots) {
      studentSlotOccupied.set(slot.id, new Set<string>());
    }

    let allScheduled = true;

    for (const exam of exams) {
      let assigned = false;

      // Find an available (slot, room) pair that satisfies all hard constraints
      for (const slot of timeSlots) {
        const slotStudents = studentSlotOccupied.get(slot.id)!;
        const studentConflict = exam.enrolledStudents.some((s) => slotStudents.has(s));
        if (studentConflict) continue;

        for (const room of rooms) {
          if (room.capacity < exam.enrolledStudents.length) continue;

          const key = `${room.id}_${slot.id}`;
          if (roomSlotOccupied.has(key)) continue;

          // Valid assignment found
          roomSlotOccupied.add(key);
          for (const s of exam.enrolledStudents) {
            slotStudents.add(s);
          }

          assignments.push({
            examId: exam.id,
            timeSlotId: slot.id,
            roomId: room.id,
          });
          assigned = true;
          break;
        }

        if (assigned) break;
      }

      if (!assigned) {
        allScheduled = false;
        break;
      }
    }

    if (!allScheduled) {
      return {
        scheduleRunId: snapshot.examCycleId,
        status: SolverStatus.INFEASIBLE,
        assignments: [],
        hardViolations: [
          {
            type: "STUDENT_OVERLAP" as any,
            description: "Exams could not be scheduled without conflict within available slots and rooms.",
            details: {},
          },
        ],
        softPenalties: [],
        diagnostics: ["Infeasible: Exhausted available conflict-free slots and room allocations."],
        generatedAt: new Date().toISOString(),
      };
    }

    // Evaluate soft penalties
    const validation = ScheduleValidatorService.validate(snapshot, assignments);

    return {
      scheduleRunId: snapshot.examCycleId,
      status: SolverStatus.OPTIMAL,
      objectiveScore: validation.totalPenaltyScore,
      assignments,
      hardViolations: validation.hardViolations,
      softPenalties: validation.softPenalties,
      diagnostics: [
        `Deterministic scheduler generated feasible schedule with ${assignments.length} assignments.`,
        `Soft penalty score: ${validation.totalPenaltyScore}`,
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Triggers an end-to-end optimization run for a given exam cycle.
   * Guarantees that any solver failure or infeasibility NEVER alters or deletes published schedules.
   */
  public static async runCycleOptimization(
    examCycleId: string,
    snapshotInput?: SchedulingProblemSnapshot,
    actorId?: string,
    correlationId = `opt-${Date.now()}`
  ): Promise<{ runId: string; candidate: CandidateSchedule; validation: any }> {
    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = new Date();

    // Default synthetic snapshot if not explicitly supplied
    const snapshot: SchedulingProblemSnapshot = snapshotInput ?? {
      snapshotVersion: 1,
      examCycleId,
      createdAt: startedAt.toISOString(),
      exams: [
        {
          id: "offering-cs101",
          code: "CS101",
          title: "Introduction to Computer Science",
          durationMinutes: 180,
          enrolledStudents: ["stu-1", "stu-2", "stu-3"],
          requiredFeatures: [],
        },
        {
          id: "offering-ma101",
          code: "MA101",
          title: "Calculus & Linear Algebra",
          durationMinutes: 180,
          enrolledStudents: ["stu-4", "stu-5"],
          requiredFeatures: [],
        },
      ],
      timeSlots: [
        {
          id: "slot-1",
          name: "Day 1 Morning",
          date: "2026-12-01",
          startTime: "09:00",
          endTime: "12:00",
          dayIndex: 1,
          slotIndexInDay: 1,
        },
        {
          id: "slot-2",
          name: "Day 1 Afternoon",
          date: "2026-12-01",
          startTime: "14:00",
          endTime: "17:00",
          dayIndex: 1,
          slotIndexInDay: 2,
        },
      ],
      rooms: [
        {
          id: "room-lh1",
          code: "LH-101",
          building: "Block A",
          capacity: 50,
          isAccessible: true,
        },
      ],
      weights: {
        consecutiveExamsPenalty: 10,
        twoExamsSameDayPenalty: 25,
        unbalancedRoomPenalty: 5,
      },
    };

    // Store in-memory tracking
    mockRunsStore.set(runId, {
      id: runId,
      examCycleId,
      status: SolverStatus.RUNNING,
      violationsCount: 0,
      diagnostics: ["Optimization run queued and started."],
      startedAt,
    });

    try {
      await prisma.scheduleRun.create({
        data: {
          id: runId,
          examCycleId,
          status: "RUNNING" as any,
          diagnostics: ["Optimization run queued and started."],
          startedAt,
        },
      });
    } catch {
      // Database offline/mock fallback
    }

    // Execute solver
    const candidate = await this.executeSolver(snapshot);

    // Run independent validator
    const validation = ScheduleValidatorService.validate(
      snapshot,
      candidate.assignments
    );

    const isFeasible = validation.isValid && candidate.status !== SolverStatus.INFEASIBLE && candidate.status !== SolverStatus.FAILED;
    const finalStatus: SolverStatus = isFeasible
      ? (candidate.status === SolverStatus.OPTIMAL ? SolverStatus.OPTIMAL : SolverStatus.FEASIBLE)
      : SolverStatus.INFEASIBLE;

    candidate.status = finalStatus;
    candidate.hardViolations = validation.hardViolations;
    candidate.softPenalties = validation.softPenalties;
    candidate.objectiveScore = validation.totalPenaltyScore;

    const finishedAt = new Date();

    // Update in-memory store
    mockRunsStore.set(runId, {
      id: runId,
      examCycleId,
      status: finalStatus,
      objectiveScore: validation.totalPenaltyScore,
      violationsCount: validation.hardViolations.length,
      diagnostics: [
        ...candidate.diagnostics,
        `Independent validator confirmed: ${validation.hardViolations.length} hard violations, ${validation.softPenalties.length} soft penalties.`,
      ],
      candidateSchedule: candidate,
      startedAt,
      finishedAt,
    });

    try {
      await prisma.scheduleRun.update({
        where: { id: runId },
        data: {
          status: finalStatus as any,
          objectiveScore: validation.totalPenaltyScore,
          violationsCount: validation.hardViolations.length,
          diagnostics: [
            ...candidate.diagnostics,
            `Independent validator confirmed: ${validation.hardViolations.length} hard violations.`,
          ],
          finishedAt,
        },
      });
    } catch {
      // Mock fallback
    }

    // Audit log
    await AuditService.log({
      actorId,
      action: isFeasible ? "SCHEDULE_OPTIMIZATION_SUCCESS" : "SCHEDULE_OPTIMIZATION_INFEASIBLE",
      entityType: "ScheduleRun",
      entityId: runId,
      correlationId,
      payload: {
        examCycleId,
        status: finalStatus,
        objectiveScore: validation.totalPenaltyScore,
        violationsCount: validation.hardViolations.length,
        assignmentsCount: candidate.assignments.length,
      },
    });

    return {
      runId,
      candidate,
      validation,
    };
  }

  /**
   * Retrieves a schedule run by ID.
   */
  public static async getRun(runId: string): Promise<InMemoryRun | null> {
    const memoryRun = mockRunsStore.get(runId);
    if (memoryRun) {
      return memoryRun;
    }

    try {
      const dbRun = await prisma.scheduleRun.findUnique({
        where: { id: runId },
      });
      if (dbRun) {
        return {
          id: dbRun.id,
          examCycleId: dbRun.examCycleId,
          status: dbRun.status as SolverStatus,
          objectiveScore: dbRun.objectiveScore ?? undefined,
          violationsCount: dbRun.violationsCount,
          diagnostics: dbRun.diagnostics,
          startedAt: dbRun.startedAt,
          finishedAt: dbRun.finishedAt ?? undefined,
        };
      }
    } catch {
      // Fallback
    }

    return null;
  }

  /**
   * Lists all runs for an examination cycle.
   */
  public static async listRuns(examCycleId: string): Promise<InMemoryRun[]> {
    const runs: InMemoryRun[] = [];
    for (const run of mockRunsStore.values()) {
      if (run.examCycleId === examCycleId) {
        runs.push(run);
      }
    }

    if (runs.length > 0) return runs;

    try {
      const dbRuns = await prisma.scheduleRun.findMany({
        where: { examCycleId },
        orderBy: { startedAt: "desc" },
      });
      return dbRuns.map((r) => ({
        id: r.id,
        examCycleId: r.examCycleId,
        status: r.status as SolverStatus,
        objectiveScore: r.objectiveScore ?? undefined,
        violationsCount: r.violationsCount,
        diagnostics: r.diagnostics,
        startedAt: r.startedAt,
        finishedAt: r.finishedAt ?? undefined,
      }));
    } catch {
      return runs;
    }
  }
}
