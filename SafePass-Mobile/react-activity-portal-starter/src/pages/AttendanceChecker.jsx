import { useState } from "react";

function AttendanceChecker() {
  const [employeeName, setEmployeeName] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [attendance, setAttendance] = useState(null);

  function handleCheck(event) {
    event.preventDefault();

    // TODO: Convert timeIn to a number.
    // TODO: Use if / else if / else to classify On Time, Late, or Very Late.
    setAttendance({
      employeeName,
      timeIn,
      status: "TODO",
      message: "TODO: Add attendance message."
    });
  }

  function handleReset() {
    // TODO: Clear all fields and attendance result.
  }

  return (
    <section className="card">
      <p className="eyebrow">Activity 5</p>
      <h2>Employee Attendance Checker</h2>

      <form onSubmit={handleCheck} className="form-grid">
        <label>
          Employee Name
          <input value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} placeholder="Enter employee name" />
        </label>

        <label>
          Time In
          <input type="number" step="0.1" value={timeIn} onChange={(event) => setTimeIn(event.target.value)} placeholder="Example: 8.5" />
        </label>

        <div className="button-row">
          <button type="submit">Check Attendance</button>
          <button type="button" className="secondary" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {attendance && (
        <div className="result-panel">
          <p>Employee: {attendance.employeeName}</p>
          <p>Time In: {attendance.timeIn}</p>
          <p>Status: {attendance.status}</p>
          <p>{attendance.message}</p>
        </div>
      )}
    </section>
  );
}

export default AttendanceChecker;
