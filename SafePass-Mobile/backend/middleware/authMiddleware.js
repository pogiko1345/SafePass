const jwt = require("jsonwebtoken");
const User = require("../models/User");

const normalizeRole = (role = "") => {
  const normalized = String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
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

const isSecurityDepartmentUser = (user = {}) => {
  const role = normalizeRole(user?.role);
  if (role === "security") return true;

  const department = String(user?.department || "").trim().toLowerCase();
  const position = String(user?.position || "").trim().toLowerCase();
  return role === "staff" && (department.includes("security") || position.includes("security"));
};

const getRequiredEnvValue = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, getRequiredEnvValue("JWT_SECRET"));
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

const requireRoles = (...roles) => {
  const allowedRoles = new Set(roles.flat().map(normalizeRole).filter(Boolean));

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    const securityDepartmentAllowed =
      allowedRoles.has("security") && isSecurityDepartmentUser(req.user);
    if (!userRole || (!allowedRoles.has(userRole) && !securityDepartmentAllowed)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  isSecurityDepartmentUser,
  normalizeRole,
  requireRoles,
};
