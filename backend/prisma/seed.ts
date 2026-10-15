import { PrismaClient, Role, ExamCycleStatus, ScheduleVersionStatus, InvigilatorRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Nexora synthetic database seeding...");

  // 1. Departments
  const deptCSE = await prisma.department.upsert({
    where: { code: "CSE" },
    update: {},
    create: { code: "CSE", name: "Computer Science & Engineering" },
  });

  const deptECE = await prisma.department.upsert({
    where: { code: "ECE" },
    update: {},
    create: { code: "ECE", name: "Electronics & Communication Engineering" },
  });

  const deptME = await prisma.department.upsert({
    where: { code: "MECH" },
    update: {},
    create: { code: "MECH", name: "Mechanical Engineering" },
  });

  // 2. Programs
  const progCSE = await prisma.program.upsert({
    where: { code: "BTECH-CSE" },
    update: {},
    create: {
      code: "BTECH-CSE",
      name: "Bachelor of Technology in Computer Science",
      departmentId: deptCSE.id,
    },
  });

  // 3. Academic Term
  const termAutumn = await prisma.academicTerm.upsert({
    where: { name: "Autumn 2026-27" },
    update: {},
    create: {
      name: "Autumn 2026-27",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-20"),
      isActive: true,
    },
  });

  // 4. Subjects
  const subCS701 = await prisma.subject.upsert({
    where: { code: "CS701" },
    update: {},
    create: {
      code: "CS701",
      title: "Distributed Systems & Cloud Computing",
      credits: 4,
      departmentId: deptCSE.id,
    },
  });

  const subEC702 = await prisma.subject.upsert({
    where: { code: "EC702" },
    update: {},
    create: {
      code: "EC702",
      title: "VLSI Architecture & Embedded Logic",
      credits: 4,
      departmentId: deptECE.id,
    },
  });

  const subME703 = await prisma.subject.upsert({
    where: { code: "ME703" },
    update: {},
    create: {
      code: "ME703",
      title: "Finite Element Methods & Dynamics",
      credits: 4,
      departmentId: deptME.id,
    },
  });

  const subCS704 = await prisma.subject.upsert({
    where: { code: "CS704" },
    update: {},
    create: {
      code: "CS704",
      title: "Cryptography & Network Security",
      credits: 3,
      departmentId: deptCSE.id,
    },
  });

  // 5. Subject Offerings
  const offeringCS701 = await prisma.subjectOffering.upsert({
    where: {
      subjectId_academicTermId_semester: {
        subjectId: subCS701.id,
        academicTermId: termAutumn.id,
        semester: 7,
      },
    },
    update: {},
    create: {
      subjectId: subCS701.id,
      academicTermId: termAutumn.id,
      semester: 7,
    },
  });

  const offeringCS704 = await prisma.subjectOffering.upsert({
    where: {
      subjectId_academicTermId_semester: {
        subjectId: subCS704.id,
        academicTermId: termAutumn.id,
        semester: 7,
      },
    },
    update: {},
    create: {
      subjectId: subCS704.id,
      academicTermId: termAutumn.id,
      semester: 7,
    },
  });

  // 6. Examination Rooms
  const hallA = await prisma.room.upsert({
    where: { code: "HALL-A101" },
    update: {},
    create: {
      code: "HALL-A101",
      building: "Main Academic Block",
      floor: 1,
      capacity: 150,
      hasProjector: true,
      isAccessible: true,
    },
  });

  const hallB = await prisma.room.upsert({
    where: { code: "HALL-B204" },
    update: {},
    create: {
      code: "HALL-B204",
      building: "Science Block",
      floor: 2,
      capacity: 100,
      hasProjector: true,
      isAccessible: true,
    },
  });

  // 7. Users and Faculty
  const userFaculty = await prisma.user.upsert({
    where: { email: "a.sharma@nexora.edu" },
    update: {},
    create: {
      email: "a.sharma@nexora.edu",
      passwordHash: "$2b$10$syntheticHashForDevSeedOnly12345678901234567890",
      name: "Dr. A. Sharma",
      role: Role.FACULTY,
    },
  });

  await prisma.faculty.upsert({
    where: { employeeCode: "FAC-1082" },
    update: {},
    create: {
      userId: userFaculty.id,
      employeeCode: "FAC-1082",
      departmentId: deptCSE.id,
      designation: "Associate Professor",
      maxDutiesPerWeek: 3,
    },
  });

  // 8. Exam Cycle
  const examCycle = await prisma.examCycle.upsert({
    where: { id: "cycle-autumn-2026" },
    update: {},
    create: {
      id: "cycle-autumn-2026",
      academicTermId: termAutumn.id,
      name: "Autumn 2026 Regular & Backlogs",
      registrationStart: new Date("2026-10-01"),
      registrationEnd: new Date("2026-10-25"),
      status: ExamCycleStatus.SCHEDULING,
    },
  });

  // 9. Exam Offerings
  const examCS701 = await prisma.examOffering.upsert({
    where: {
      examCycleId_subjectOfferingId: {
        examCycleId: examCycle.id,
        subjectOfferingId: offeringCS701.id,
      },
    },
    update: {},
    create: {
      examCycleId: examCycle.id,
      subjectOfferingId: offeringCS701.id,
      durationMinutes: 180,
    },
  });

  const examCS704 = await prisma.examOffering.upsert({
    where: {
      examCycleId_subjectOfferingId: {
        examCycleId: examCycle.id,
        subjectOfferingId: offeringCS704.id,
      },
    },
    update: {},
    create: {
      examCycleId: examCycle.id,
      subjectOfferingId: offeringCS704.id,
      durationMinutes: 180,
    },
  });

  console.log("✅ Synthetic database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
