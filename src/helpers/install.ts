import { execSync } from "child_process";

export const install = () => {
  execSync("npm ci", { stdio: "inherit" });
};
