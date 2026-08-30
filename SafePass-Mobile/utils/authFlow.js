export const normalizeRole = (role) => {
  const normalized = String(role || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (
    [
      "guard",
      "security_staff",
      "security_officer",
      "security_guard",
      "guard_officer",
    ].includes(normalized)
  ) {
    return "security";
  }
  return normalized;
};

const isSecurityDepartmentStaff = (user = {}) => {
  if (normalizeRole(user?.role) !== "staff") return false;

  const department = String(user?.department || "").toLowerCase();
  const position = String(user?.position || "").toLowerCase();
  return department.includes("security") || position.includes("security");
};

export const isRecognizedRole = (role) =>
  ["visitor", "security", "guard", "admin", "staff", "student", "teacher"].includes(normalizeRole(role));

export const getDashboardRoute = (userOrRole) => {
  const role =
    typeof userOrRole === "string"
      ? normalizeRole(userOrRole)
      : normalizeRole(userOrRole?.role);

  switch (role) {
    case "admin":
      return "AdminDashboard";
    case "staff":
      return "StaffDashboard";
    case "security":
    case "guard":
      return "SecurityDashboard";
    case "student":
    case "teacher":
      return "StudentDashboard";
    case "visitor":
      return "VisitorDashboard";
    default:
      return "RoleSelect";
  }
};

export const canAccessSecurityDashboard = (userOrRole) => {
  const role =
    typeof userOrRole === "string"
      ? normalizeRole(userOrRole)
      : normalizeRole(userOrRole?.role);

  return ["admin", "security"].includes(role) || isSecurityDepartmentStaff(userOrRole);
};

export const canAccessReports = (userOrRole) => {
  if (!userOrRole) return false;
  const role =
    typeof userOrRole === "string"
      ? normalizeRole(userOrRole)
      : normalizeRole(userOrRole?.role);

  if (role === "admin") return true;

  if (role === "staff" && typeof userOrRole === "object") {
    const position = String(userOrRole?.position || "").toLowerCase();
    const department = String(userOrRole?.department || "").toLowerCase();
    return (
      position.includes("secretary") ||
      position.includes("executive assistant") ||
      position.includes("administrative assistant") ||
      position.includes("administrative officer") ||
      position.includes("office coordinator") ||
      position.includes("records officer") ||
      position.includes("front desk") ||
      position.includes("registrar") ||
      position.includes("admissions") ||
      department.includes("administration") ||
      department.includes("secretary") ||
      department.includes("registrar") ||
      department.includes("admissions") ||
      department.includes("director")
    );
  }

  return false;
};

