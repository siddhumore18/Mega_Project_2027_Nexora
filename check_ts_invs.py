import re
from collections import Counter, defaultdict

with open("frontend/src/services/academicDataStore.ts", "r", encoding="utf-8") as f:
    text_ads = f.read()

# Match TS style: invigilator: "..."
ts_invs = re.findall(r'invigilator:\s*"([^"]+)"', text_ads)
print(f"Total invigilator occurrences in academicDataStore.ts: {len(ts_invs)}")
print("Occurrences:", Counter(ts_invs).most_common(10))

with open("frontend/src/data/kitExamData.ts", "r", encoding="utf-8") as f:
    text_kit = f.read()
kit_invs = re.findall(r'invigilator:\s*"([^"]+)"', text_kit)
print(f"Total invigilator occurrences in kitExamData.ts: {len(kit_invs)}")
print("Occurrences:", Counter(kit_invs).most_common(10))

