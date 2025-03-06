import { execSync } from "child_process";
import fs from "node:fs";

export const runBuild = () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const packageScripts = packageJson.scripts;

  if (!packageScripts) {
    throw new Error("package.json does not contain a scripts field.");
  }

  const buildScript = packageScripts["build"];

  if (!buildScript) {
    throw new Error("package.json does not contain a build script.");
  }

  execSync("npm run build", { stdio: "inherit" });
};
