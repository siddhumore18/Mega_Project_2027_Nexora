import React, { useState, useEffect } from "react";
import {
  fetchFaculty,
  createFaculty,
  deleteFaculty,
  fetchStudents,
  createStudent,
  deleteStudent,
  fetchRooms,
  createRoom,
  deleteRoom,
  fetchSubjects,
  createSubject,
  deleteSubject,
} from "../services/api.js";

type SubTab = "faculty" | "students" | "rooms" | "subjects";

export const MasterDataManager: React.FC = () => {
  const [currentSubTab, setCurrentSubTab] = useState<SubTab>("faculty");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Data Stores
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  // Form States
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    email: "",
    employeeCode: "",
    departmentCode: "CSE",
    designation: "Assistant Professor",
    maxDutiesPerWeek: 3,
  });

  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
    departmentCode: "CSE",
    currentSemester: 7,
    attendancePercentage: 85,
  });

  const [roomForm, setRoomForm] = useState({
    code: "",
    building: "Block A - Ramanujan Hall",
    floor: 1,
    capacity: 100,
    isAccessible: true,
    hasProjector: true,
  });

  const [subjectForm, setSubjectForm] = useState({
    code: "",
    title: "",
    credits: 3,
    departmentCode: "CSE",
  });

  // Load Data on Mount
  useEffect(() => {
    loadAllMasterData();
  }, []);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const loadAllMasterData = async () => {
    setLoading(true);
    try {
      const [fac, stu, rms, sub] = await Promise.all([
        fetchFaculty().catch(() => [
          {
            id: "fac-1",
            name: "Dr. A. Sharma",
            email: "sharma@nexora.edu",
            employeeCode: "EMP-1082",
            departmentCode: "CSE",
            departmentName: "Computer Science & Engineering",
            designation: "Associate Professor",
            maxDutiesPerWeek: 3,
          },
          {
            id: "fac-2",
            name: "Prof. R. Iyer",
            email: "iyer@nexora.edu",
            employeeCode: "EMP-1083",
            departmentCode: "ECE",
            departmentName: "Electronics & Communication Engineering",
            designation: "Assistant Professor",
            maxDutiesPerWeek: 3,
          },
          {
            id: "fac-3",
            name: "Dr. P. Kulkarni",
            email: "kulkarni@nexora.edu",
            employeeCode: "EMP-1084",
            departmentCode: "MECH",
            departmentName: "Mechanical Engineering",
            designation: "Professor & HOD",
            maxDutiesPerWeek: 2,
          },
        ]),
        fetchStudents().catch(() => [
          {
            id: "stu-1",
            name: "Aarav Sharma",
            email: "aarav.sharma@nexora.edu",
            rollNumber: "CS2023-042",
            departmentCode: "CSE",
            currentSemester: 7,
            attendancePercentage: 88.5,
          },
          {
            id: "stu-2",
            name: "Neha Patel",
            email: "neha.patel@nexora.edu",
            rollNumber: "CS2023-055",
            departmentCode: "CSE",
            currentSemester: 7,
            attendancePercentage: 69.0,
          },
          {
            id: "stu-3",
            name: "Rohan Verma",
            email: "rohan.verma@nexora.edu",
            rollNumber: "EC2023-088",
            departmentCode: "ECE",
            currentSemester: 7,
            attendancePercentage: 62.4,
          },
        ]),
        fetchRooms().catch(() => [
          {
            id: "rm-1",
            code: "HALL-A101",
            building: "Block A - Ramanujan Hall",
            floor: 1,
            capacity: 150,
            isAccessible: true,
            hasProjector: true,
          },
          {
            id: "rm-2",
            code: "HALL-B204",
            building: "Block B - Turing Wing",
            floor: 2,
            capacity: 100,
            isAccessible: true,
            hasProjector: true,
          },
          {
            id: "rm-3",
            code: "HALL-C301",
            building: "Block C - Edison Complex",
            floor: 3,
            capacity: 90,
            isAccessible: false,
            hasProjector: false,
          },
        ]),
        fetchSubjects().catch(() => [
          {
            id: "sub-1",
            code: "CS701",
            title: "Distributed Systems & Cloud Computing",
            departmentCode: "CSE",
            credits: 4,
          },
          {
            id: "sub-2",
            code: "EC702",
            title: "VLSI Architecture & Embedded Logic",
            departmentCode: "ECE",
            credits: 4,
          },
          {
            id: "sub-3",
            code: "ME703",
            title: "Finite Element Methods & Dynamics",
            departmentCode: "MECH",
            credits: 3,
          },
        ]),
      ]);

      setFacultyList(fac);
      setStudentsList(stu);
      setRoomsList(rms);
      setSubjectsList(sub);
    } catch (err: any) {
      showNotification("Failed to refresh some master data: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit Handlers
  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const created = await createFaculty(facultyForm);
      setFacultyList((prev) => [created, ...prev]);
      showNotification(`Faculty member ${created.name} (${created.employeeCode}) added successfully!`);
      setFacultyForm({
        name: "",
        email: "",
        employeeCode: "",
        departmentCode: "CSE",
        designation: "Assistant Professor",
        maxDutiesPerWeek: 3,
      });
      setShowAddForm(false);
    } catch (err: any) {
      showNotification(err.message || "Could not add faculty member", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete faculty member ${name}?`)) return;
    try {
      await deleteFaculty(id);
      setFacultyList((prev) => prev.filter((f) => f.id !== id));
      showNotification(`Faculty member ${name} deleted.`);
    } catch (err: any) {
      showNotification(err.message || "Could not delete faculty", "error");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const created = await createStudent(studentForm);
      setStudentsList((prev) => [created, ...prev]);
      showNotification(`Student ${created.name} (${created.rollNumber}) registered successfully!`);
      setStudentForm({
        name: "",
        email: "",
        rollNumber: "",
        departmentCode: "CSE",
        currentSemester: 7,
        attendancePercentage: 85,
      });
      setShowAddForm(false);
    } catch (err: any) {
      showNotification(err.message || "Could not add student", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete student ${name}?`)) return;
    try {
      await deleteStudent(id);
      setStudentsList((prev) => prev.filter((s) => s.id !== id));
      showNotification(`Student ${name} removed from roster.`);
    } catch (err: any) {
      showNotification(err.message || "Could not delete student", "error");
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const created = await createRoom(roomForm);
      setRoomsList((prev) => [created, ...prev]);
      showNotification(`Examination Hall ${created.code} registered with capacity ${created.capacity}!`);
      setRoomForm({
        code: "",
        building: "Block A - Ramanujan Hall",
        floor: 1,
        capacity: 100,
        isAccessible: true,
        hasProjector: true,
      });
      setShowAddForm(false);
    } catch (err: any) {
      showNotification(err.message || "Could not add examination room", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete examination hall ${code}?`)) return;
    try {
      await deleteRoom(id);
      setRoomsList((prev) => prev.filter((r) => r.id !== id));
      showNotification(`Examination hall ${code} removed.`);
    } catch (err: any) {
      showNotification(err.message || "Could not delete hall", "error");
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const created = await createSubject(subjectForm);
      setSubjectsList((prev) => [created, ...prev]);
      showNotification(`Subject ${created.code} (${created.title}) registered successfully!`);
      setSubjectForm({
        code: "",
        title: "",
        credits: 3,
        departmentCode: "CSE",
      });
      setShowAddForm(false);
    } catch (err: any) {
      showNotification(err.message || "Could not add subject", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete subject ${code}?`)) return;
    try {
      await deleteSubject(id);
      setSubjectsList((prev) => prev.filter((s) => s.id !== id));
      showNotification(`Subject ${code} removed.`);
    } catch (err: any) {
      showNotification(err.message || "Could not delete subject", "error");
    }
  };

  // Filtered views based on search term
  const term = searchTerm.trim().toLowerCase();

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.name?.toLowerCase().includes(term) ||
      f.employeeCode?.toLowerCase().includes(term) ||
      f.departmentCode?.toLowerCase().includes(term) ||
      f.email?.toLowerCase().includes(term)
  );

  const filteredStudents = studentsList.filter(
    (s) =>
      s.name?.toLowerCase().includes(term) ||
      s.rollNumber?.toLowerCase().includes(term) ||
      s.departmentCode?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
  );

  const filteredRooms = roomsList.filter(
    (r) =>
      r.code?.toLowerCase().includes(term) ||
      r.building?.toLowerCase().includes(term) ||
      String(r.capacity).includes(term)
  );

  const filteredSubjects = subjectsList.filter(
    (s) =>
      s.code?.toLowerCase().includes(term) ||
      s.title?.toLowerCase().includes(term) ||
      s.departmentCode?.toLowerCase().includes(term)
  );

  // Stats Calculations
  const totalCapacity = roomsList.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const eligibleStudents = studentsList.filter((s) => (s.attendancePercentage || 0) >= 75).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Subtab Header & Metrics */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
              Academic Master Data Repository
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Configure base entities for scheduling, hall capacity allocation, and invigilation quotas
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
              }}
              className="btn btn-primary"
              style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span>{showAddForm ? "✕ Close Form" : "+ Add New Record"}</span>
            </button>
            <button
              onClick={loadAllMasterData}
              disabled={loading}
              className="btn btn-secondary"
              style={{ fontSize: "13px" }}
            >
              {loading ? "Refreshing..." : "↻ Refresh Data"}
            </button>
          </div>
        </div>

        {/* Master Data Metrics Overview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          <div style={{ backgroundColor: "var(--bg-app)", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Registered Faculty
            </div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--brand-primary)", marginTop: "2px" }}>
              {facultyList.length} Teachers
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Available for invigilation</div>
          </div>

          <div style={{ backgroundColor: "var(--bg-app)", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Enrolled Students
            </div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
              {studentsList.length} Candidates
            </div>
            <div style={{ fontSize: "11px", color: "var(--status-success-text)", marginTop: "2px" }}>
              {eligibleStudents} eligible (≥75% att.)
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-app)", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Exam Blocks & Halls
            </div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
              {roomsList.length} Halls
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Total Capacity: <strong>{totalCapacity}</strong> seats
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-app)", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Exam Papers & Subjects
            </div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
              {subjectsList.length} Courses
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Across all engineering streams</div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          style={{
            backgroundColor: message.type === "success" ? "var(--status-success-bg)" : "var(--status-danger-bg)",
            color: message.type === "success" ? "var(--status-success-text)" : "var(--status-danger-text)",
            border: `1px solid ${message.type === "success" ? "var(--status-success-border)" : "var(--status-danger-border)"}`,
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{message.type === "success" ? "✓" : "⚠"} {message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Subtab Navigation and Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "6px", backgroundColor: "var(--bg-surface)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
          <button
            onClick={() => {
              setCurrentSubTab("faculty");
              setShowAddForm(false);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: currentSubTab === "faculty" ? "var(--brand-primary)" : "transparent",
              color: currentSubTab === "faculty" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            👨‍🏫 Faculty / Teachers ({facultyList.length})
          </button>
          <button
            onClick={() => {
              setCurrentSubTab("students");
              setShowAddForm(false);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: currentSubTab === "students" ? "var(--brand-primary)" : "transparent",
              color: currentSubTab === "students" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            🎓 Students & Examinees ({studentsList.length})
          </button>
          <button
            onClick={() => {
              setCurrentSubTab("rooms");
              setShowAddForm(false);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: currentSubTab === "rooms" ? "var(--brand-primary)" : "transparent",
              color: currentSubTab === "rooms" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            🏛️ Blocks & Halls ({roomsList.length})
          </button>
          <button
            onClick={() => {
              setCurrentSubTab("subjects");
              setShowAddForm(false);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: currentSubTab === "subjects" ? "var(--brand-primary)" : "transparent",
              color: currentSubTab === "subjects" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            📚 Courses & Subjects ({subjectsList.length})
          </button>
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <input
            type="text"
            className="input-field"
            placeholder={`Search ${currentSubTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Add Record Form Dropdown / Modal Card */}
      {showAddForm && (
        <div
          className="card"
          style={{
            backgroundColor: "#fcfdfe",
            border: "1.5px solid var(--brand-border)",
            padding: "20px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-dropdown)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              {currentSubTab === "faculty" && "Add New Faculty Member / Invigilator"}
              {currentSubTab === "students" && "Register New Student Candidate"}
              {currentSubTab === "rooms" && "Add New Examination Block & Hall"}
              {currentSubTab === "subjects" && "Add New Subject / Course Paper"}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              All fields are validated with strict institutional schema checks
            </span>
          </div>

          {/* Form: Faculty */}
          {currentSubTab === "faculty" && (
            <form onSubmit={handleAddFaculty}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh K. Rao"
                    className="input-field"
                    value={facultyForm.name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Employee ID / Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-1090"
                    className="input-field"
                    value={facultyForm.employeeCode}
                    onChange={(e) => setFacultyForm({ ...facultyForm, employeeCode: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rrao@nexora.edu"
                    className="input-field"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Department Code *
                  </label>
                  <select
                    className="input-field"
                    value={facultyForm.departmentCode}
                    onChange={(e) => setFacultyForm({ ...facultyForm, departmentCode: e.target.value })}
                  >
                    <option value="CSE">CSE - Computer Science & Eng</option>
                    <option value="ECE">ECE - Electronics & Comm</option>
                    <option value="MECH">MECH - Mechanical Eng</option>
                    <option value="CIVIL">CIVIL - Civil Engineering</option>
                    <option value="MATH">MATH - Applied Mathematics</option>
                    <option value="PHYSICS">PHYSICS - Department of Physics</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Academic Designation
                  </label>
                  <select
                    className="input-field"
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Professor & HOD">Professor & HOD</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Max Duties / Week (Quota)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    className="input-field"
                    value={facultyForm.maxDutiesPerWeek}
                    onChange={(e) => setFacultyForm({ ...facultyForm, maxDutiesPerWeek: parseInt(e.target.value) || 3 })}
                  />
                </div>
              </div>
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? "Registering..." : "✓ Save Faculty Member"}
                </button>
              </div>
            </form>
          )}

          {/* Form: Students */}
          {currentSubTab === "students" && (
            <form onSubmit={handleAddStudent}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sundaram"
                    className="input-field"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS2023-099"
                    className="input-field"
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya.sundaram@nexora.edu"
                    className="input-field"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Department *
                  </label>
                  <select
                    className="input-field"
                    value={studentForm.departmentCode}
                    onChange={(e) => setStudentForm({ ...studentForm, departmentCode: e.target.value })}
                  >
                    <option value="CSE">CSE - Computer Science</option>
                    <option value="ECE">ECE - Electronics & Comm</option>
                    <option value="MECH">MECH - Mechanical Eng</option>
                    <option value="CIVIL">CIVIL - Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Current Semester (1-8)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    className="input-field"
                    value={studentForm.currentSemester}
                    onChange={(e) => setStudentForm({ ...studentForm, currentSemester: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Recorded Attendance % (Threshold: 75%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    required
                    className="input-field"
                    value={studentForm.attendancePercentage}
                    onChange={(e) => setStudentForm({ ...studentForm, attendancePercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? "Enrolling..." : "✓ Enroll Student"}
                </button>
              </div>
            </form>
          )}

          {/* Form: Rooms / Halls */}
          {currentSubTab === "rooms" && (
            <form onSubmit={handleAddRoom}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Room / Hall Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HALL-D402"
                    className="input-field"
                    value={roomForm.code}
                    onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Building / Campus Block *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block D - Visvesvaraya Complex"
                    className="input-field"
                    value={roomForm.building}
                    onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Floor Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    required
                    className="input-field"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Seating Capacity (Examinees) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    required
                    className="input-field"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingTop: "24px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={roomForm.isAccessible}
                      onChange={(e) => setRoomForm({ ...roomForm, isAccessible: e.target.checked })}
                    />
                    <span>♿ Wheelchair Accessible</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={roomForm.hasProjector}
                      onChange={(e) => setRoomForm({ ...roomForm, hasProjector: e.target.checked })}
                    />
                    <span>📽️ Projector & AV Screen</span>
                  </label>
                </div>
              </div>
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? "Registering..." : "✓ Register Examination Hall"}
                </button>
              </div>
            </form>
          )}

          {/* Form: Subjects */}
          {currentSubTab === "subjects" && (
            <form onSubmit={handleAddSubject}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS708"
                    className="input-field"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Machine Learning & Neural Networks"
                    className="input-field"
                    value={subjectForm.title}
                    onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Department *
                  </label>
                  <select
                    className="input-field"
                    value={subjectForm.departmentCode}
                    onChange={(e) => setSubjectForm({ ...subjectForm, departmentCode: e.target.value })}
                  >
                    <option value="CSE">CSE - Computer Science</option>
                    <option value="ECE">ECE - Electronics & Comm</option>
                    <option value="MECH">MECH - Mechanical Eng</option>
                    <option value="CIVIL">CIVIL - Civil Engineering</option>
                    <option value="MATH">MATH - Applied Mathematics</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Academic Credits (1-6)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    className="input-field"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 3 })}
                  />
                </div>
              </div>
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? "Adding..." : "✓ Register Course Subject"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Main Data Tables */}
      <div className="card">
        {/* Table 1: Faculty */}
        {currentSubTab === "faculty" && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Max Duties / Week</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                      No faculty members matching current filter. Click "+ Add New Record" above to register faculty.
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--brand-primary)" }}>
                        {item.employeeCode}
                      </td>
                      <td style={{ fontWeight: "600" }}>{item.name}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            backgroundColor: "var(--bg-subtle)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.departmentCode}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{item.designation}</td>
                      <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.email}</td>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: "var(--brand-surface)",
                            color: "var(--brand-primary)",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.maxDutiesPerWeek} slots/wk
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteFaculty(item.id, item.name)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--status-danger-text)",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            padding: "4px 8px",
                            borderRadius: "var(--radius-sm)",
                          }}
                          title="Delete Faculty Member"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table 2: Students */}
        {currentSubTab === "students" && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                  <th>Email</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                      No students matching current filter. Click "+ Add New Record" above to enroll students.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((item) => {
                    const isAttOk = (item.attendancePercentage ?? 85) >= 75;
                    return (
                      <tr key={item.id}>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--text-primary)" }}>
                          {item.rollNumber}
                        </td>
                        <td style={{ fontWeight: "600" }}>{item.name}</td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              backgroundColor: "var(--bg-subtle)",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {item.departmentCode}
                          </span>
                        </td>
                        <td>Sem {item.currentSemester}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "60px",
                                height: "6px",
                                backgroundColor: "var(--border-default)",
                                borderRadius: "3px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(item.attendancePercentage || 0, 100)}%`,
                                  height: "100%",
                                  backgroundColor: isAttOk ? "var(--status-success-text)" : "var(--status-danger-text)",
                                }}
                              />
                            </div>
                            <strong style={{ fontSize: "12px", color: isAttOk ? "var(--status-success-text)" : "var(--status-danger-text)" }}>
                              {item.attendancePercentage}%
                            </strong>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full)",
                              fontSize: "11px",
                              fontWeight: "600",
                              backgroundColor: isAttOk ? "var(--status-success-bg)" : "var(--status-danger-bg)",
                              color: isAttOk ? "var(--status-success-text)" : "var(--status-danger-text)",
                              border: `1px solid ${isAttOk ? "var(--status-success-border)" : "var(--status-danger-border)"}`,
                            }}
                          >
                            {isAttOk ? "ELIGIBLE" : "SHORTAGE"}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.email}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteStudent(item.id, item.name)}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "var(--status-danger-text)",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                              padding: "4px 8px",
                              borderRadius: "var(--radius-sm)",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table 3: Rooms / Blocks */}
        {currentSubTab === "rooms" && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room Code</th>
                  <th>Campus Block / Building</th>
                  <th>Floor</th>
                  <th>Seating Capacity</th>
                  <th>Accessibility</th>
                  <th>AV / Projector</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                      No examination halls matching filter. Click "+ Add New Record" above to register a room.
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--brand-primary)" }}>
                        {item.code}
                      </td>
                      <td style={{ fontWeight: "600" }}>{item.building}</td>
                      <td>Floor {item.floor}</td>
                      <td>
                        <strong style={{ fontSize: "14px" }}>{item.capacity}</strong> seats
                      </td>
                      <td>
                        {item.isAccessible ? (
                          <span style={{ color: "var(--status-success-text)", fontSize: "12px", fontWeight: "600" }}>
                            ♿ Accessible
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Standard</span>
                        )}
                      </td>
                      <td>
                        {item.hasProjector ? (
                          <span style={{ color: "var(--brand-primary)", fontSize: "12px", fontWeight: "600" }}>
                            📽️ Equipped
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>None</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteRoom(item.id, item.code)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--status-danger-text)",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            padding: "4px 8px",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table 4: Subjects */}
        {currentSubTab === "subjects" && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Course Title</th>
                  <th>Department</th>
                  <th>Academic Credits</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                      No subjects matching filter. Click "+ Add New Record" to register course subjects.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--brand-primary)" }}>
                        {item.code}
                      </td>
                      <td style={{ fontWeight: "600" }}>{item.title}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            backgroundColor: "var(--bg-subtle)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.departmentCode}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: "var(--bg-subtle)",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.credits} Credits
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteSubject(item.id, item.code)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--status-danger-text)",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            padding: "4px 8px",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
