import json
import re
from collections import defaultdict, Counter
from ortools.sat.python import cp_model

# 1. Load exams
with open("frontend/src/data/kitRealExamData.ts", "r", encoding="utf-8") as f:
    text = f.read()

exams_match = re.search(r'export const KIT_PDF_EXAMS:\s*CoordinatorExamEntry\[\]\s*=\s*(\[[\s\S]*?\]);', text)
exams = json.loads(exams_match.group(1))

# Group exams by (date, slot, room)
block_dict = defaultdict(list)
for ex in exams:
    key = (ex["date"], ex["slot"], ex["room"])
    block_dict[key].append(ex)

blocks = []
for (d, s, r), ex_list in block_dict.items():
    dept = ex_list[0].get("department", "CSE")
    blocks.append({
        "date": d,
        "slot": s,
        "room": r,
        "dept": dept,
        "weight": len(ex_list),
        "exams": ex_list
    })

# 2. Load faculty
with open("frontend/src/data/kitRealFaculty.ts", "r", encoding="utf-8") as f:
    fac_text = f.read()

fac_match = re.search(r'export const KIT_REAL_FACULTY:\s*InvigilatorRosterRecord\[\]\s*=\s*(\[[\s\S]*?\]);', fac_text)
faculty_list = json.loads(fac_match.group(1))

N_blocks = len(blocks)
N_fac = len(faculty_list)
print(f"Blocks: {N_blocks}, Faculty: {N_fac}")

# Group blocks by date
date_blocks = defaultdict(list)
for b_idx, b in enumerate(blocks):
    date_blocks[b["date"]].append(b_idx)

# Build CP-SAT model
model = cp_model.CpModel()

# x[b, f] = 1 if faculty f is assigned to block b
x = {}
for b_idx in range(N_blocks):
    for f_idx in range(N_fac):
        x[b_idx, f_idx] = model.NewBoolVar(f"x_{b_idx}_{f_idx}")

# Constraint 1: Each block is assigned to exactly one faculty
for b_idx in range(N_blocks):
    model.Add(sum(x[b_idx, f_idx] for f_idx in range(N_fac)) == 1)

# Constraint 2: At most 1 block per date for each faculty
for date, b_indices in date_blocks.items():
    for f_idx in range(N_fac):
        model.Add(sum(x[b_idx, f_idx] for b_idx in b_indices) <= 1)

# Constraint 3 & 4: Equal blocks (7 to 8) and Equal papers (9 to 10)
for f_idx in range(N_fac):
    # Total blocks for faculty f
    model.Add(sum(x[b_idx, f_idx] for b_idx in range(N_blocks)) >= 7)
    model.Add(sum(x[b_idx, f_idx] for b_idx in range(N_blocks)) <= 8)
    
    # Total papers for faculty f
    total_papers = sum(blocks[b_idx]["weight"] * x[b_idx, f_idx] for b_idx in range(N_blocks))
    model.Add(total_papers >= 9)
    model.Add(total_papers <= 10)

# Objective: Minimize same-department assignments (impartial invigilation)
obj_terms = []
for b_idx, b in enumerate(blocks):
    b_dept = b["dept"]
    for f_idx, f in enumerate(faculty_list):
        f_dept = f["departmentCode"]
        if b_dept == f_dept:
            obj_terms.append(x[b_idx, f_idx])

model.Minimize(sum(obj_terms))

# Solve
solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = 10.0
solver.parameters.num_workers = 4

print("Solving CP-SAT model for perfect equal distribution...")
status = solver.Solve(model)

if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
    print(f"Solved in {solver.WallTime():.2f}s with status: {solver.StatusName(status)}")
    
    # Evaluate distribution
    fac_blocks = [0] * N_fac
    fac_papers = [0] * N_fac
    fac_dates = [set() for _ in range(N_fac)]
    
    for b_idx in range(N_blocks):
        for f_idx in range(N_fac):
            if solver.BooleanValue(x[b_idx, f_idx]):
                fac_blocks[f_idx] += 1
                fac_papers[f_idx] += blocks[b_idx]["weight"]
                fac_dates[f_idx].add(blocks[b_idx]["date"])
    
    print("Block distribution across all 88 faculty:", Counter(fac_blocks))
    print("Paper distribution across all 88 faculty:", Counter(fac_papers))
    
    # Check max duties on same date
    multi_duties = sum(1 for f_idx in range(N_fac) if len(fac_dates[f_idx]) < fac_blocks[f_idx])
    print(f"Faculty with >1 duty on same date: {multi_duties}")
else:
    print("Model was infeasible or timed out!")

