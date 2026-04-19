const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Visitor = require("../models/Visitor");
const User = require("../models/User");
const AccessLog = require("../models/AccessLog");
const Notification = require("../models/Notification");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sapphire_aviation";

const args = new Set(process.argv.slice(2));
const shouldDelete = args.has("--confirm");
const onlyVisitors = args.has("--only-visitors");

const maskMongoUri = (uri) =>
  uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, "$1****$3");

async function countTargets() {
  const visitorIds = await Visitor.distinct("_id");
  const visitorUserQuery = {
    $or: [{ role: "visitor" }, { visitorId: { $in: visitorIds } }],
  };
  const visitorUserIds = await User.distinct("_id", visitorUserQuery);

  const accessLogQuery = {
    $or: [
      { relatedVisitor: { $in: visitorIds } },
      { userId: { $in: visitorUserIds } },
      { actorRole: "visitor" },
    ],
  };

  const notificationQuery = {
    $or: [
      { relatedVisitor: { $in: visitorIds } },
      { targetUser: { $in: visitorUserIds } },
      { targetRole: "visitor" },
    ],
  };

  return {
    visitorIds,
    visitorUserIds,
    visitorUserQuery,
    accessLogQuery,
    notificationQuery,
    counts: {
      visitors: await Visitor.countDocuments(),
      visitorUsers: await User.countDocuments(visitorUserQuery),
      visitorAccessLogs: await AccessLog.countDocuments(accessLogQuery),
      visitorNotifications: await Notification.countDocuments(notificationQuery),
    },
  };
}

async function main() {
  console.log("Connecting to:", maskMongoUri(MONGODB_URI));
  await mongoose.connect(MONGODB_URI);

  const targets = await countTargets();
  console.log("\nVisitor cleanup preview:");
  console.table(targets.counts);

  if (onlyVisitors) {
    console.log(
      "\nMode: --only-visitors. This removes only Visitor documents and may leave visitor accounts pointing to missing records.",
    );
  } else {
    console.log(
      "\nMode: safe visitor cleanup. This keeps admin/staff/security accounts, but removes visitor records, visitor user accounts, and visitor-related logs/notifications.",
    );
  }

  if (!shouldDelete) {
    console.log("\nNo data was deleted.");
    console.log("Run again with --confirm to clear the previewed visitor data.");
    await mongoose.disconnect();
    return;
  }

  const deleted = {};

  if (!onlyVisitors) {
    deleted.accessLogs = (
      await AccessLog.deleteMany(targets.accessLogQuery)
    ).deletedCount;
    deleted.notifications = (
      await Notification.deleteMany(targets.notificationQuery)
    ).deletedCount;
    deleted.visitorUsers = (
      await User.deleteMany(targets.visitorUserQuery)
    ).deletedCount;
  }

  deleted.visitors = (await Visitor.deleteMany({})).deletedCount;

  console.log("\nDeleted visitor data:");
  console.table(deleted);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Visitor cleanup failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
