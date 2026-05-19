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
