import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function handleLogin(event) {
    event.preventDefault();

    // TODO: Add if / else logic:
    // 1. both fields empty
    // 2. correct credentials
    // 3. incorrect credentials
    setMessage("TODO: Add login validation here.");
  }

  function handleLogout() {
    // TODO: Return to the login form and clear the message.
  }

  return (
    <section className="card">
      <p className="eyebrow">Activity 1</p>
      <h2>Login Authentication</h2>

      {!isLoggedIn ? (
        <form onSubmit={handleLogin} className="form-grid">
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter username" />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" />
          </label>

          <button type="submit">Login</button>
        </form>
      ) : (
        <div className="result-panel">
          <strong>Welcome!</strong>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {message && <p className="feedback">{message}</p>}
    </section>
  );
}

export default Login;
