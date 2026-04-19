const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Notification = require("../models/Notification");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sapphire_aviation";

const DEMO_PASSWORD = "StaffDemo123!";

const demoStaffAccounts = [
  {
    firstName: "Rina",
    lastName: "Registrar",
    username: "registrar.staff",
    email: "registrar.staff@sapphire.edu",
    phone: "09170000001",
    employeeId: "STF-DEMO-REG",
    department: "Registrar",
    position: "Registrar Officer",
  },
  {
    firstName: "Arnel",
    lastName: "Accounting",
    username: "accounting.staff",
    email: "accounting.staff@sapphire.edu",
    phone: "09170000002",
    employeeId: "STF-DEMO-ACC",
    department: "Accounting",
    position: "Accounting Officer",
  },
  {
    firstName: "Cara",
    lastName: "Cashier",
    username: "cashier.staff",
    email: "cashier.staff@sapphire.edu",
    phone: "09170000003",
    employeeId: "STF-DEMO-CASH",
    department: "Cashier",
    position: "Cashier",
  },
  {
    firstName: "Ian",
    lastName: "Info",
    username: "info.staff",
    email: "info.staff@sapphire.edu",
    phone: "09170000004",
    employeeId: "STF-DEMO-INFO",
    department: "Information Desk",
    position: "Front Desk Officer",
  },
  {
    firstName: "Gia",
    lastName: "Guidance",
    username: "guidance.staff",
    email: "guidance.staff@sapphire.edu",
    phone: "09170000005",
    employeeId: "STF-DEMO-GUID",
    department: "Guidance",
    position: "Guidance Officer",
  },
  {
    firstName: "Alden",
    lastName: "Admin",
    username: "adminoffice.staff",
    email: "adminoffice.staff@sapphire.edu",
    phone: "09170000006",
    employeeId: "STF-DEMO-ADMIN",
    department: "Administration",
    position: "Administrative Officer",
  },
  {
    firstName: "Faye",
    lastName: "Operations",
    username: "flightops.staff",
    email: "flightops.staff@sapphire.edu",
    phone: "09170000007",
    employeeId: "STF-DEMO-FOPS",
    department: "Flight Operations",
    position: "Flight Operations Officer",
  },
  {
    firstName: "Troy",
    lastName: "Training",
    username: "training.staff",
    email: "training.staff@sapphire.edu",
    phone: "09170000008",
    employeeId: "STF-DEMO-TRAIN",
    department: "Training",
    position: "Training Officer",
  },
  {
    firstName: "Ivy",
    lastName: "Tech",
    username: "it.staff",
    email: "it.staff@sapphire.edu",
    phone: "09170000009",
    employeeId: "STF-DEMO-IT",
    department: "I.T Room",
    position: "I.T Officer",
  },
  {
    firstName: "Felix",
    lastName: "Faculty",
    username: "faculty.staff",
    email: "faculty.staff@sapphire.edu",
    phone: "09170000010",
    employeeId: "STF-DEMO-FAC",
    department: "Faculty Room",
    position: "Faculty Coordinator",
  },
  {
    firstName: "Lara",
    lastName: "Laboratory",
    username: "laboratory.staff",
    email: "laboratory.staff@sapphire.edu",
    phone: "09170000011",
    employeeId: "STF-DEMO-LAB",
    department: "Laboratory",
    position: "Laboratory Instructor",
  },
  {
    firstName: "Tessa",
    lastName: "Tesda",
    username: "tesda.staff",
    email: "tesda.staff@sapphire.edu",
    phone: "09170000012",
    employeeId: "STF-DEMO-TESDA",
    department: "TESDA",
    position: "TESDA Coordinator",
  },
  {
    firstName: "Warren",
    lastName: "Workshop",
    username: "workshop.staff",
    email: "workshop.staff@sapphire.edu",
    phone: "09170000013",
    employeeId: "STF-DEMO-WORK",
    department: "Workshop",
    position: "Workshop Instructor",
  },
  {
    firstName: "Lino",
    lastName: "Library",
    username: "library.staff",
    email: "library.staff@sapphire.edu",
    phone: "09170000014",
    employeeId: "STF-DEMO-LIB",
    department: "Library",
    position: "Librarian",
  },
  {
    firstName: "Sofia",
    lastName: "Student",
    username: "studentservices.staff",
    email: "studentservices.staff@sapphire.edu",
    phone: "09170000015",
    employeeId: "STF-DEMO-STUD",
    department: "Student Services",
    position: "Student Services Officer",
  },
  {
    firstName: "Sam",
    lastName: "Safety",
    username: "sto.staff",
    email: "sto.staff@sapphire.edu",
    phone: "09170000016",
    employeeId: "STF-DEMO-STO",
    department: "STO",
    position: "STO Officer",
  },
];

const upsertDemoStaff = async (account) => {
  const normalizedEmail = account.email.toLowerCase();
  let user = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: account.username.toLowerCase() },
      { employeeId: account.employeeId },
    ],
  });

  if (!user) {
    user = new User();
  }

  user.firstName = account.firstName;
  user.lastName = account.lastName;
  user.username = account.username;
  user.email = normalizedEmail;
  user.password = DEMO_PASSWORD;
  user.phone = account.phone;
  user.role = "staff";
  user.status = "active";
  user.isActive = true;
  user.isVerified = true;
  user.employeeId = account.employeeId;
  user.department = account.department;
  user.position = account.position;
  user.nfcCardId = undefined;
  user.updatedAt = new Date();

  if (!user.createdAt) {
    user.createdAt = new Date();
  }

  await user.save();
  return user;
};

const seedDemoStaff = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to ${MONGODB_URI.includes("mongodb+srv") ? "Atlas" : "local MongoDB"}`);

    const results = [];
    for (const account of demoStaffAccounts) {
      const user = await upsertDemoStaff(account);
      results.push(user);
      console.log(`Ready: ${user.email} | ${user.department} | ${user.position}`);
    }

    await Notification.create({
      title: "Demo staff accounts ready",
      message: `${results.length} demo staff accounts were created or updated for appointment routing.`,
      type: "info",
      severity: "low",
      targetRole: "admin",
      metadata: {
        source: "seedDemoStaff",
        accounts: results.map((user) => ({
          email: user.email,
          username: user.username,
          department: user.department,
          position: user.position,
        })),
      },
    });

    console.log("");
    console.log("Demo staff credentials");
    console.log("Password for all accounts:", DEMO_PASSWORD);
    console.table(
      results.map((user) => ({
        email: user.email,
        username: user.username,
        department: user.department,
        position: user.position,
      })),
    );
  } catch (error) {
    console.error("Seed demo staff error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDemoStaff();
