import { execSync } from "child_process";
import fs from "node:fs";

export const runTests = () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const packageScripts = packageJson.scripts;

  if (!packageScripts) {
    throw new Error("package.json does not contain a scripts field.");
  }

  const testScript = packageScripts["test"];

  if (!testScript) {
    throw new Error("package.json does not contain a test script.");
  }

  execSync("npm run test", { stdio: "inherit" });
};
