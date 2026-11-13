import json
import re
from collections import defaultdict, Counter

# Let's read kitRealExamData.ts
with open("frontend/src/data/kitRealExamData.ts", "r", encoding="utf-8") as f:
    text_real = f.read()

exams_match = re.search(r'export const KIT_PDF_EXAMS:\s*CoordinatorExamEntry\[\]\s*=\s*(\[[\s\S]*?\]);', text_real)
pdf_exams = json.loads(exams_match.group(1))

# Let's read BASE_COORDINATOR_EXAMS from academicDataStore.ts
with open("frontend/src/services/academicDataStore.ts", "r", encoding="utf-8") as f:
    text_store = f.read()

base_exams_match = re.search(r'const BASE_COORDINATOR_EXAMS:\s*CoordinatorExamEntry\[\]\s*=\s*(\[[\s\S]*?\]);\s*const generateDefaultSeatingRecords', text_store)
if base_exams_match:
    print("Found BASE_COORDINATOR_EXAMS")

# Let's count sessionKeys across mergedExams
# mergedExams = pdf_exams + base_exams
# Let's see:
fac_sessions = defaultdict(set)
fac_raw_exams = defaultdict(list)

for ex in pdf_exams:
    inv = ex.get("invigilator", "")
    if not inv: continue
    clean = re.sub(r'\s*\(.*?\)', '', inv).strip().lower()
    fac_sessions[clean].add(f"{ex['date']}_{ex['slot']}_{ex.get('room', 'Room')}")
    fac_raw_exams[clean].append(ex)

print("PDF exams only:")
print("  Duty count distribution (distinct blocks):", Counter(len(v) for v in fac_sessions.values()))
print("  Paper count distribution (raw papers):", Counter(len(v) for v in fac_raw_exams.values()))

# Now let's check what happened if someone counts raw exam papers:
# Some faculty have 7 papers, some have 8, 9, 10, 11, 12!
counts_raw = {k: len(v) for k, v in fac_raw_exams.items()}
print("Raw paper min:", min(counts_raw.values()), "max:", max(counts_raw.values()))
for k, v in counts_raw.items():
    if v == 7 or v == 11 or v == 12:
        print(f"  {k}: raw_papers={v}, blocks={len(fac_sessions[k])}")

