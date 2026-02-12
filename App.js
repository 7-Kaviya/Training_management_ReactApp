import React, { useState, useEffect } from "react";
import "./styles.css";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const [subjects, setSubjects] = useState(
    JSON.parse(localStorage.getItem("subjects")) || []
  );
  const [courses, setCourses] = useState(
    JSON.parse(localStorage.getItem("courses")) || []
  );
  const [batches, setBatches] = useState(
    JSON.parse(localStorage.getItem("batches")) || []
  );
  const [students, setStudents] = useState(
    JSON.parse(localStorage.getItem("students")) || []
  );

  const [name, setName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");

  useEffect(() => localStorage.setItem("subjects", JSON.stringify(subjects)), [subjects]);
  useEffect(() => localStorage.setItem("courses", JSON.stringify(courses)), [courses]);
  useEffect(() => localStorage.setItem("batches", JSON.stringify(batches)), [batches]);
  useEffect(() => localStorage.setItem("students", JSON.stringify(students)), [students]);
  /* ================= SUBJECT ================= */

  const addSubject = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Subject name required");

    const exists = subjects.some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (exists) return setError("Duplicate subject not allowed");

    setSubjects(prev => [...prev, trimmed]);
    setName("");
    setError("");
  };

  const deleteSubject = subject => {
    setSubjects(prev => prev.filter(s => s !== subject));

    setCourses(prev =>
      prev.map(c => ({
        ...c,
        subjects: c.subjects.filter(s => s !== subject),
      }))
    );
  };

  /* ================= COURSE ================= */

  const toggleSubject = subject => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const addCourse = () => {
    const trimmed = name.trim();

    if (!trimmed) return setError("Course name required");
    if (subjects.length < 2) return setError("Create at least 2 subjects first");
    if (selectedSubjects.length < 2)
      return setError("Minimum 2 subjects required");

    const exists = courses.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return setError("Duplicate course name");

    setCourses(prev => [...prev, { name: trimmed, subjects: selectedSubjects }]);

    setName("");
    setSelectedSubjects([]);
    setError("");
  };

  const deleteCourse = courseName => {
    setCourses(prev => prev.filter(c => c.name !== courseName));
    setBatches(prev => prev.filter(b => b.course !== courseName));
    setStudents(prev => prev.filter(s => s.course !== courseName));
  };

  /* ================= BATCH ================= */

  const addBatch = () => {
    if (!name.trim() || !selectedCourse || !start || !end)
      return setError("All fields required");

    if (start >= end)
      return setError("Start time must be before end time");

    const overlap = batches.some(b =>
      b.course === selectedCourse && !(end <= b.start || start >= b.end)
    );

    if (overlap) return setError("Batch timing overlaps");

    setBatches(prev => [...prev, { name, course: selectedCourse, start, end }]);

    setName("");
    setSelectedCourse("");
    setStart("");
    setEnd("");
    setError("");
  };

  const deleteBatch = batchName => {
    setBatches(prev => prev.filter(b => b.name !== batchName));
    setStudents(prev => prev.filter(s => s.batch !== batchName));
  };

  /* ================= STUDENT ================= */

  const addStudent = () => {
    if (!name.trim() || !selectedCourse || !selectedSubjects.length)
      return setError("All fields required");

    setStudents(prev => [
      ...prev,
      { name, course: selectedCourse, batch: selectedSubjects[0] },
    ]);

    setName("");
    setSelectedCourse("");
    setSelectedSubjects([]);
    setError("");
  };

  const filteredBatches = batches.filter(b => b.course === selectedCourse);

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>Training Management System</h1>

      <nav>
        {["dashboard", "subjects", "courses", "batches", "students"].map(p => (
          <button key={p} onClick={() => { setPage(p); setError(""); }}>
            {p.toUpperCase()}
          </button>
        ))}
      </nav>

      {page === "dashboard" && (
        <div className="grid">
          <div className="card">Total Subjects: {subjects.length}</div>
          <div className="card">Total Courses: {courses.length}</div>
          <div className="card">Total Batches: {batches.length}</div>
          <div className="card">Total Students: {students.length}</div>
        </div>
      )}

      {page !== "dashboard" && (
        <div className="card">
          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          {page === "subjects" && <button onClick={addSubject}>Add Subject</button>}
          {page === "courses" && (
            <>
              {subjects.map(subject => (
                  <div key={subject} className="subject-row">
                  <label>
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                  />
                  <span>{subject}</span>
                  </label>
                  </div>
              ))}
              <div className="action-row">
               <button onClick={addCourse}>Create Course</button>
              </div>
              </>
          )}

          {page === "batches" && (
            <>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <input type="time" value={start} onChange={e => setStart(e.target.value)} />
              <input type="time" value={end} onChange={e => setEnd(e.target.value)} />
              <button onClick={addBatch}>Create Batch</button>
            </>
          )}

          {page === "students" && (
            <>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedSubjects[0] || ""}
                onChange={e => setSelectedSubjects([e.target.value])}
              >
                <option value="">Select Batch</option>
                {filteredBatches.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>

              <button onClick={addStudent}>Add Student</button>
            </>
          )}

          {error && <p className="error">{error}</p>}
        </div>
      )}

      {/* LIST DISPLAY */}

      {page === "subjects" &&
        subjects.map(s => (
          <div key={s} className="card">
            {s}
            <button onClick={() => deleteSubject(s)}>Delete</button>
          </div>
        ))}

      {page === "courses" &&
        <div className="course-table">
        <div className="course-header">
          <span>Course Name</span>
          <span>Subjects</span>
          <span>Actions</span>
        </div>
      {courses.map(course => (
        <div key={course.name} className="course-row">
          <span>{course.name}</span>
          <span>{course.subjects.join(", ")}</span>
          <span>
        <button className="danger-btn" onClick={() => deleteCourse(course.name)}
        >Delete</button>
          </span>
        </div>
      ))}
      </div>
      }

      {page === "batches" &&
        batches.map(b => (
          <div key={b.name} className="card">
            {b.name} ({b.course}) {b.start}-{b.end}
            <button onClick={() => deleteBatch(b.name)}>Delete</button>
          </div>
        ))}

      {page === "students" &&
        <div className="student-table">
        <div className="student-header">
          <span>Name</span>
          <span>Course</span>
          <span>Batch</span>
        </div>
        {students.map((s, i) => (
        <div key={i} className="student-row">
          <span>{s.name}</span>
          <span>{s.course}</span>
          <span>{s.batch}</span>
        </div>
        ))}
        </div>
        }
       </div>
  );
}
