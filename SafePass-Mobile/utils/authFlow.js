export const normalizeRole = (role) => String(role || "").toLowerCase().trim();

export const isRecognizedRole = (role) =>
  ["visitor", "security", "guard", "admin", "staff"].includes(normalizeRole(role));

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

  return ["admin", "security", "guard", "staff"].includes(role);
};
