const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sapphire_aviation";

const STUDENT_PASSWORD = "Student123!";

const studentAccounts = Array.from({ length: 5 }, (_, index) => {
  const number = index + 1;
  const paddedNumber = String(number).padStart(3, "0");

  return {
    firstName: "Student",
    lastName: String(number),
    username: `student${number}`,
    email: `student${number}@sapphire.edu`,
    phone: `0918000000${number}`,
    studentId: `STU-${paddedNumber}`,
    nfcCardId: `SAFEPASS-STUDENT-${paddedNumber}`,
    guardianName: `Guardian ${number}`,
    guardianEmail: `guardian${number}@example.com`,
    guardianPhone: `0919000000${number}`,
    course: "Aircraft Maintenance",
    yearLevel: "1st Year",
    section: `Section ${number}`,
  };
});

const upsertStudent = async (account) => {
  const normalizedEmail = account.email.toLowerCase();
  const normalizedUsername = account.username.toLowerCase();

  const existingCardOwner = await User.findOne({
    nfcCardId: account.nfcCardId,
    email: { $ne: normalizedEmail },
  });

  if (existingCardOwner) {
    throw new Error(
      `NFC card ${account.nfcCardId} is already assigned to ${existingCardOwner.email}.`,
    );
  }

  let user = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: normalizedUsername },
      { studentId: account.studentId },
    ],
  });

  if (!user) {
    user = new User();
    user.createdAt = new Date();
  }

  user.firstName = account.firstName;
  user.lastName = account.lastName;
  user.username = normalizedUsername;
  user.email = normalizedEmail;
  user.password = STUDENT_PASSWORD;
  user.phone = account.phone;
  user.role = "student";
  user.status = "active";
  user.isActive = true;
  user.isVerified = true;
  user.studentId = account.studentId;
  user.nfcCardId = account.nfcCardId;
  user.guardianName = account.guardianName;
  user.guardianEmail = account.guardianEmail;
  user.guardianPhone = account.guardianPhone;
  user.smsOptIn = true;
  user.course = account.course;
  user.yearLevel = account.yearLevel;
  user.section = account.section;
  user.updatedAt = new Date();

  await user.save();
  return user;
};

const seedStudents = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to ${MONGODB_URI.includes("mongodb+srv") ? "Atlas" : "local MongoDB"}`);

    const results = [];
    for (const account of studentAccounts) {
      const user = await upsertStudent(account);
      results.push(user);
      console.log(`Ready: ${user.email} | ${user.studentId} | ${user.nfcCardId}`);
    }

    console.log("");
    console.log("Student accounts ready");
    console.log("Password for all accounts:", STUDENT_PASSWORD);
    console.table(
      results.map((user) => ({
        email: user.email,
        username: user.username,
        studentId: user.studentId,
        nfcCardId: user.nfcCardId,
        status: user.status,
      })),
    );
  } catch (error) {
    console.error("Seed students error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedStudents();
