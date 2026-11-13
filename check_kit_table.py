import json
import re
from collections import defaultdict, Counter

with open("frontend/src/data/kitExamData.ts", "r", encoding="utf-8") as f:
    text_kit = f.read()

kit_exams_match = re.search(r'export const KIT_ESE_2026_TIMETABLE:\s*CoordinatorExamEntry\[\]\s*=\s*(\[[\s\S]*?\]);', text_kit)
if kit_exams_match:
    kit_exams = json.loads(kit_exams_match.group(1))
    print(f"Loaded {len(kit_exams)} exams from KIT_ESE_2026_TIMETABLE")
    invs = [e.get("invigilator") for e in kit_exams]
    print("Invs in KIT_ESE_2026_TIMETABLE:", Counter(invs))

