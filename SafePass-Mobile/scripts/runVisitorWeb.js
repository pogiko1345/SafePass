const { spawnSync } = require("child_process");

const mode = process.argv[2] === "start" ? "web" : "build:web";
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? `npm.cmd run ${mode}` : "npm";
const npmArgs = isWindows ? [] : ["run", mode];

const result = spawnSync(npmCommand, npmArgs, {
  stdio: "inherit",
  shell: isWindows,
  env: {
    ...process.env,
    EXPO_PUBLIC_APP_VARIANT: "visitor",
  },
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
