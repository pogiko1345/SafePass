const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sapphire_aviation";
const ROLE_GROUPS = {
  student: ["student", "teacher"],
  staff: ["staff"],
  security: ["security", "guard"],
};

const maskEmail = (email = "") => {
  const [local, domain] = String(email).split("@");
  if (!local || !domain) return email || "No email";
  return `${local.slice(0, 2)}***@${domain}`;
};

const main = async () => {
  await mongoose.connect(MONGODB_URI);

  console.log("CentriX/SafePass role account audit");
  console.log("Database:", MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@"));
  console.log("");

  for (const [label, roles] of Object.entries(ROLE_GROUPS)) {
    const users = await User.find({ role: { $in: roles } })
      .select("firstName lastName email role status isActive nfcCardId lastLogin")
      .sort({ role: 1, email: 1 })
      .lean();

    const activeUsers = users.filter((user) => user.status === "active" && user.isActive !== false);
    console.log(`${label.toUpperCase()}: ${activeUsers.length} active / ${users.length} total`);

    users.slice(0, 10).forEach((user) => {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed";
      const activeLabel = user.status === "active" && user.isActive !== false ? "active" : "not active";
      const nfcLabel = user.nfcCardId ? "NFC assigned" : "no NFC";
      console.log(`- ${name} (${user.role}) ${maskEmail(user.email)} - ${activeLabel}, ${nfcLabel}`);
    });

    if (users.length > 10) {
      console.log(`- ...and ${users.length - 10} more`);
    }

    if (!activeUsers.length) {
      console.log(`! No active ${label} login found. Create one in Admin or run the seed in a demo database.`);
    }

    console.log("");
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("Account audit failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
