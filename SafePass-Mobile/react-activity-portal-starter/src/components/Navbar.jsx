function Navbar({ activePage, setActivePage }) {
  return (
    <header className="navbar">
      <h1>React Activity Portal</h1>

      <nav>
        <button className={activePage === "home" ? "active" : ""} onClick={() => setActivePage("home")}>
          Home
        </button>
        <button className={activePage === "login" ? "active" : ""} onClick={() => setActivePage("login")}>
          Activity 1
        </button>
        <button className={activePage === "grades" ? "active" : ""} onClick={() => setActivePage("grades")}>
          Activity 2
        </button>
        <button className={activePage === "password" ? "active" : ""} onClick={() => setActivePage("password")}>
          Activity 3
        </button>
        <button className={activePage === "electricity" ? "active" : ""} onClick={() => setActivePage("electricity")}>
          Activity 4
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
