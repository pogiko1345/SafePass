const jwt = require("jsonwebtoken");
const User = require("../models/User");

const normalizeRole = (role = "") => {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "guard") return "security";
  return normalized;
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
    if (!userRole || !allowedRoles.has(userRole)) {
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
  normalizeRole,
  requireRoles,
};
