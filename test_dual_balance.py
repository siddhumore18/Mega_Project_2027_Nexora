import json
import re
from collections import defaultdict, Counter

with open("frontend/src/data/kitRealExamData.ts", "r", encoding="utf-8") as f:
    text = f.read()

exams_match = re.search(r'export const KIT_PDF_EXAMS:\s*CoordinatorExamEntry\[\]\s*=\s*(\[[\s\S]*?\]);', text)
exams = json.loads(exams_match.group(1))

# Group exams by (date, slot, room)
blocks = []
block_exams = defaultdict(list)
seen_blocks = set()

for ex in exams:
    key = (ex["date"], ex["slot"], ex["room"])
    block_exams[key].append(ex)
    if key not in seen_blocks:
        seen_blocks.add(key)
        blocks.append((ex["date"], ex["slot"], ex["room"], ex.get("department", "CSE"), len(block_exams[key])))

# Update block sizes
blocks = [(d, s, r, dept, len(block_exams[(d, s, r)])) for (d, s, r, dept, _) in blocks]
print(f"Total exams: {len(exams)}")
print(f"Total blocks: {len(blocks)}")
block_sizes = Counter(b[4] for b in blocks)
print("Block sizes (# of papers in block):", dict(block_sizes))

# Load faculty list from kitRealFaculty.ts
with open("frontend/src/data/kitRealFaculty.ts", "r", encoding="utf-8") as f:
    fac_text = f.read()

fac_match = re.search(r'export const KIT_REAL_FACULTY:\s*InvigilatorRosterRecord\[\]\s*=\s*(\[[\s\S]*?\]);', fac_text)
faculty_list = json.loads(fac_match.group(1))
print(f"Total faculty: {len(faculty_list)}")

# We have 88 faculty.
# Total blocks = 695.
# Total papers = 835.
# 835 / 88 = 9.488 papers/faculty -> so 43 faculty with 10 papers, 45 faculty with 9 papers!
# 695 / 88 = 7.897 blocks/faculty -> so 79 faculty with 8 blocks, 9 faculty with 7 blocks!
# Target:
# Every faculty must have:
# - blocks in {7, 8}
# - papers in {9, 10}
# - at most 1 block per date (0 same-day clashes)

