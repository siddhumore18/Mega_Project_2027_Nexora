import json
import re
from collections import defaultdict, Counter

# Let's check kitRealExamData.ts
with open("frontend/src/data/kitRealExamData.ts", "r", encoding="utf-8") as f:
    text = f.read()

pattern = re.compile(
    r'\{[^{}]*?"date":\s*"([^"]+)".*?"slot":\s*"([^"]+)".*?"room":\s*"([^"]+)".*?"invigilator":\s*"([^"]+)"[^{}]*?\}',
    re.DOTALL
)
matches = pattern.findall(text)

sessions = defaultdict(set)
raw_counts = defaultdict(int)
for d, s, r, inv in matches:
    clean = re.sub(r'\s*\(.*?\)', '', inv).strip().lower()
    sessions[clean].add(f'{d}_{s}_{r}')
    raw_counts[clean] += 1

print("In KIT_PDF_EXAMS (kitRealExamData.ts):")
print("  Unique session blocks per teacher distribution:", Counter(len(v) for v in sessions.values()))
print("  Raw exam papers per teacher distribution:", Counter(raw_counts.values()))
for name, cnt in sorted(raw_counts.items(), key=lambda x: -x[1])[:10]:
    print(f"    {name}: raw={cnt}, blocks={len(sessions[name])}")
for name, cnt in sorted(raw_counts.items(), key=lambda x: x[1])[:5]:
    print(f"    {name}: raw={cnt}, blocks={len(sessions[name])}")

