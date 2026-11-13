import json
import re
from collections import defaultdict, Counter

# Let's check what exams exist in kitExamData.ts as well
with open("frontend/src/data/kitExamData.ts", "r", encoding="utf-8") as f:
    text_kit = f.read()

# Match exams in kitExamData
pattern = re.compile(
    r'\{[^{}]*?"date":\s*"([^"]+)".*?"slot":\s*"([^"]+)".*?"room":\s*"([^"]+)".*?"invigilator":\s*"([^"]+)"[^{}]*?\}',
    re.DOTALL
)
matches_kit = pattern.findall(text_kit)
print(f"Exams with invigilator in kitExamData.ts: {len(matches_kit)}")
kit_inv_counts = Counter(re.sub(r'\s*\(.*?\)', '', inv).strip().lower() for d, s, r, inv in matches_kit)
print("Top invigilators in kitExamData.ts:", kit_inv_counts.most_common(10))

# What about base exams in academicDataStore.ts?
with open("frontend/src/services/academicDataStore.ts", "r", encoding="utf-8") as f:
    text_ads = f.read()

matches_ads = pattern.findall(text_ads)
print(f"Exams with invigilator in academicDataStore.ts: {len(matches_ads)}")
ads_inv_counts = Counter(re.sub(r'\s*\(.*?\)', '', inv).strip().lower() for d, s, r, inv in matches_ads)
print("Top invigilators in academicDataStore.ts:", ads_inv_counts.most_common(10))

