import { z } from "zod";

export const StudentImportSchema = z.object({
  rollNumber: z.string().min(3),
  name: z.string().min(2),
  email: z.string().email(),
  programCode: z.string(),
  currentSemester: z.number().int().min(1).max(10),
});

export const RoomImportSchema = z.object({
  code: z.string().min(2),
  building: z.string().min(2),
  floor: z.number().int(),
  capacity: z.number().int().positive(),
  isAccessible: z.boolean().default(true),
});

export interface ImportValidationReport<T> {
  validCount: number;
  invalidCount: number;
  validRecords: T[];
  errors: { row: number; error: string; raw: any }[];
}

export function validateStudentBatch(records: any[]): ImportValidationReport<z.infer<typeof StudentImportSchema>> {
  const validRecords: z.infer<typeof StudentImportSchema>[] = [];
  const errors: { row: number; error: string; raw: any }[] = [];
  const seenRolls = new Set<string>();

  records.forEach((raw, index) => {
    const row = index + 1;
    const parsed = StudentImportSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push({
        row,
        error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
        raw,
      });
      return;
    }

    if (seenRolls.has(parsed.data.rollNumber.toUpperCase())) {
      errors.push({
        row,
        error: `Duplicate roll number '${parsed.data.rollNumber}' in batch.`,
        raw,
      });
      return;
    }

    seenRolls.add(parsed.data.rollNumber.toUpperCase());
    validRecords.push(parsed.data);
  });

  return {
    validCount: validRecords.length,
    invalidCount: errors.length,
    validRecords,
    errors,
  };
}
