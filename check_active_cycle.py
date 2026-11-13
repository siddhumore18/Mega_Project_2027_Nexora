import json
import re
from collections import defaultdict, Counter

with open("frontend/src/data/kitRealExamData.ts", "r", encoding="utf-8") as f:
    text = f.read()

exams_match = re.search(r'export const KIT_PDF_EXAMS:\s*CoordinatorExamEntry\[\]\s*=\s*(\[[\s\S]*?\]);', text)
exams = json.loads(exams_match.group(1))

# Check cycleId values in KIT_PDF_EXAMS
cycle_counts = Counter(e.get("cycleId") for e in exams)
print("Cycles in KIT_PDF_EXAMS:", cycle_counts)

# In CoordinatorDashboard.tsx:
# activeCycle.id by default is "cycle-ese-2026" or "cycle-ese-2026-c1"?
# Let's check what activeCycle is in CoordinatorDashboard.tsx!

