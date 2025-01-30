import { execSync } from "child_process";

export const getLatestNpmVersion = (packageName: string): string => {
  return execSync(`npm show ${packageName} version`).toString().trim();
};
