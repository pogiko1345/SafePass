const fs = require("fs");
const path = require("path");

const outputDir = path.resolve(__dirname, "..", "static");

if (!fs.existsSync(outputDir)) {
  process.exit(0);
}

for (const entry of fs.readdirSync(outputDir)) {
  const entryPath = path.join(outputDir, entry);
  fs.rmSync(entryPath, { recursive: true, force: true });
}

console.log("Cleaned web output directory.");
