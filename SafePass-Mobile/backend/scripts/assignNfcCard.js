const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sapphire_aviation";

const getArgValue = (name) => {
  const prefix = `${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : "";
};

const maskMongoUri = (uri = "") =>
  String(uri).replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, "$1****$3");

async function main() {
  const email = getArgValue("--email").toLowerCase();
  const card = getArgValue("--card").toUpperCase().replace(/[^0-9A-F]/g, "");
  const role = getArgValue("--role") || "visitor";

  if (!email || !card) {
    console.error("Usage: npm run assign:nfc -- --email=visitor@email.com --card=EEBDEA3E");
    process.exitCode = 1;
    return;
  }

  console.log(`Connecting to ${maskMongoUri(MONGODB_URI)}`);
  await mongoose.connect(MONGODB_URI);

  const existingCardOwner = await User.findOne({ nfcCardId: card }).select(
    "email role nfcCardId",
  );

  if (existingCardOwner && existingCardOwner.email !== email) {
    throw new Error(
      `Card ${card} is already assigned to ${existingCardOwner.email} (${existingCardOwner.role}).`,
    );
  }

  const user = await User.findOne({ email, role });
  if (!user) {
    throw new Error(`No ${role} user found for ${email}.`);
  }

  const previousCard = user.nfcCardId || "";
  user.nfcCardId = card;
  user.accessPermissions = {
    canAccess: user.accessPermissions?.canAccess || [],
    restrictedAreas: user.accessPermissions?.restrictedAreas || [],
    timeRestrictions: user.accessPermissions?.timeRestrictions || [],
    cardActive: true,
  };
  await user.save();

  console.log("");
  console.log("NFC card assigned successfully.");
  console.log(`User : ${user.firstName} ${user.lastName} <${user.email}>`);
  console.log(`Role : ${user.role}`);
  console.log(`Old  : ${previousCard || "(none)"}`);
  console.log(`New  : ${user.nfcCardId}`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
