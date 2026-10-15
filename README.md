# Nexora — University Exam Scheduling & Allocation System

> **Automated University Exam Timetable Scheduling, Hall Allocation & Invigilation Duty Management System**

[![CI Pipeline](https://github.com/siddhumore18/Mega_Project_2027_Nexora/actions/workflows/ci.yml/badge.svg)](https://github.com/siddhumore18/Mega_Project_2027_Nexora/actions/workflows/ci.yml)

Nexora is an enterprise-grade academic optimization platform designed to eliminate scheduling collisions, balance invigilation workloads, optimize examination hall capacities, and manage immutable timetable publications.

---

## 🎨 UI Aesthetic & Design Principles
- **Light Theme by Design**: Crisp white (`#FFFFFF`) card surfaces, soft neutral slate canvas (`#F8FAFC`), and subtle borders (`#E2E8F0`).
- **Minimalist & Distraction-Free**: Generous whitespace, zero visual clutter, high contrast ratios (WCAG AA 4.5:1+), accessible status indicators.
- **Role-Aware Perspectives**: Streamlined dashboards tailored for Examination Coordinators, Students, Faculty, and HODs.

---

## 🏗️ Repository Architecture

Nexora is organized as a clean modular repository with dedicated frontend, backend, and optimizer directories:

```text
MegaProject_2027_Nexora/
├── .github/
│   └── workflows/
│       └── ci.yml             # Automated CI for Node & Python
├── frontend/                  # React 18 + TypeScript + Vite (Minimalist Light Theme)
│   ├── src/
│   │   ├── components/        # Header, CoordinatorDashboard, RoleViews, StatusBadge
│   │   ├── services/          # Typed API client
│   │   └── styles/            # Minimalist Light Theme tokens & utilities
│   ├── package.json
│   └── vite.config.ts
├── backend/                   # Express + TypeScript REST API
│   ├── src/
│   │   ├── controllers/       # Controller logic (getHealth, etc.)
│   │   ├── middleware/        # Correlation tracing & secure error handling
│   │   └── routes/            # Route declarations (/health, /api/v1)
│   ├── tests/                 # Automated API endpoint test suite
│   └── package.json
├── optimizer/                 # Python 3.12 + Google OR-Tools constraint engine
│   ├── src/                   # CP-SAT constraint optimization prototype
│   ├── tests/                 # Automated pytest constraint validation suite
│   └── requirements.txt
├── packages/
│   └── contracts/             # Shared TypeScript schemas, types, and Zod validators
├── docs/                      # Architectural decisions, domain models & requirements
├── .env.example               # Environment variables template
├── package.json               # Root monorepo workspace configuration
└── tsconfig.base.json         # Shared strict TypeScript configuration
```

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: `v22+` / `v24+`
- **npm**: `v10+` / `v11+`
- **Python**: `3.12+` with `pip`

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/siddhumore18/Mega_Project_2027_Nexora.git
cd Mega_Project_2027_Nexora

# Install monorepo Node dependencies
npm install

# Install Python OR-Tools dependencies
pip install -r optimizer/requirements.txt
```

### 2. Run Locally
```bash
# Start Express backend server (port 4000)
npm run dev:backend

# In a separate terminal, start Vite React frontend (port 3000)
npm run dev:frontend
```

### 3. Run Automated Tests
```bash
# Run Node test suites (Backend & Contracts)
npm test

# Run Python OR-Tools constraint solver tests
pytest optimizer/tests
```

---

## 📋 Development Roadmap

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 0** | Discovery, Policies, Glossary, Decision Log & Exam Cell Questions | **Completed** |
| **Phase 1** | Foundation Scaffolding, Minimalist Light UI, Express API, OR-Tools baseline, CI | **Completed** |
| **Phase 2** | Data Model, Prisma Schema, Synthetic Seeds, DB Integrity Tests | **Completed** |
| **Phase 3** | Authentication, Role & Scoped Permissions, Audit Logging | **Completed** |
| **Phase 4** | Academic Structure & Explainable Eligibility Engine | Next |
| **Phase 5** | Exam Cycles, Offerings & Registration Windows | Planned |
| **Phase 6** | Formal Scheduling Constraint Catalogue & Fixtures | Planned |
| **Phase 7** | OR-Tools Solver Microservice & Diagnostics | Planned |
| **Phase 8** | Candidate Review, Approvals & Immutable Publication | Planned |
| **Phase 9** | Room & Seating Allocation | Planned |
| **Phase 10** | Invigilator Rostering & Conflict Rules | Planned |
| **Phase 11** | Rescheduling Impact Analysis & Notifications | Planned |
| **Phase 12** | Reports & Exports | Planned |
| **Phase 13** | Hardening, Performance Benchmarking & Release | Planned |
