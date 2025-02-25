import * as fs from "node:fs";
import { execSync } from "child_process";

export const validateStaticCode = () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const packageScripts = packageJson.scripts;

  if (!packageScripts) {
    throw new Error("package.json does not contain a scripts field.");
  }

  const staticCodeCheckScript = packageScripts["check-all"];

  if (!staticCodeCheckScript) {
    throw new Error("package.json does not contain a check-all script.");
  }

  execSync("npm run check-all", { stdio: "inherit" });
};
