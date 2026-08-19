import { useState } from "react";

function GradeEvaluation() {
  const [studentName, setStudentName] = useState("");
  const [score, setScore] = useState("");
  const [result, setResult] = useState(null);

  function handleEvaluate(event) {
    event.preventDefault();

    // TODO: Convert score to a number.
    // TODO: Use if / else if / else for Excellent, Very Good, Good, Passed, Failed, and Invalid score.
    setResult({
      studentName,
      score,
      remarks: "TODO: Evaluate the score."
    });
  }

  function handleClear() {
    // TODO: Clear all inputs and result.
  }

  return (
    <section className="card">
      <p className="eyebrow">Activity 2</p>
      <h2>Student Grade Evaluation</h2>

      <form onSubmit={handleEvaluate} className="form-grid">
        <label>
          Student Name
          <input value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Enter student name" />
        </label>

        <label>
          Score
          <input type="number" value={score} onChange={(event) => setScore(event.target.value)} placeholder="0 - 100" />
        </label>

        <div className="button-row">
          <button type="submit">Evaluate</button>
          <button type="button" className="secondary" onClick={handleClear}>Clear</button>
        </div>
      </form>

      {result && (
        <div className="result-panel">
          <p>Name: {result.studentName}</p>
          <p>Score: {result.score}</p>
          <p>Remarks: {result.remarks}</p>
        </div>
      )}
    </section>
  );
}

export default GradeEvaluation;
