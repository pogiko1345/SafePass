import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import GradeEvaluation from "./pages/GradeEvaluation.jsx";
import PasswordChecker from "./pages/PasswordChecker.jsx";
import ElectricityBill from "./pages/ElectricityBill.jsx";

function App() {
  const [activePage, setActivePage] = useState("home");

  function renderPage() {
    if (activePage === "login") {
      return <Login />;
    } else if (activePage === "grades") {
      return <GradeEvaluation />;
    } else if (activePage === "password") {
      return <PasswordChecker />;
    } else if (activePage === "electricity") {
      return <ElectricityBill />;
    }

    return <Home />;
  }

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="page-shell">{renderPage()}</main>
    </div>
  );
}

export default App;
