const mongoose = require("mongoose");
const User = require("../models/User");

const isLocalMongoUri = (uri) => /^mongodb:\/\/(127\.0\.0\.1|localhost)(:|\/)/i.test(uri);

async function main() {
  const uri = String(process.env.MONGODB_URI || "").trim();
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Refusing to seed: NODE_ENV must be exactly 'test'.");
  }
  if (!isLocalMongoUri(uri)) {
    throw new Error("Refusing to seed: MONGODB_URI must point to localhost/127.0.0.1.");
  }

  const email = String(process.env.TEST_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.TEST_ADMIN_PASSWORD || "");
  if (!email || !password) {
    throw new Error("TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD are required.");
  }
  if (password.length < 12) {
    throw new Error("TEST_ADMIN_PASSWORD must be at least 12 characters.");
  }

  await mongoose.connect(uri);
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Refusing to overwrite an existing account.");
  }

  await User.create({
    firstName: "Test",
    lastName: "Administrator",
    username: `test-admin-${Date.now()}`,
    email,
    password,
    phone: "09170000000",
    role: "admin",
    status: "active",
    isActive: true,
    isVerified: true,
    department: "Test Environment",
    position: "Temporary Test Administrator",
  });
  console.log("Temporary test admin created.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
