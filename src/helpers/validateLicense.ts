import * as fs from "node:fs";
import semver from "semver";
import { EnvVarManager } from "@/env/envVarManager";
import { getLatestNpmVersion } from "@/helpers/getLatestNpmVersion";
import { isValidSemverSuccessor } from "@/helpers/isValidSemverSuccessor";

export const validateLicense = () => {
  const licenseFileContent = fs.readFileSync("LICENSE", "utf8");

  const currentYear = new Date().getFullYear();
  const copyrightRegex = new RegExp(`Copyright ${currentYear}`);
  const authorName = EnvVarManager.getEnvVar("AUTHOR_NAME");
  const authorEmail = EnvVarManager.getEnvVar("AUTHOR_EMAIL");
  const authorNameRegex = new RegExp(
    authorName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const authorEmailRegex = new RegExp(
    authorEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  if (!copyrightRegex.test(licenseFileContent)) {
    throw new Error("LICENSE file does not contain a valid copyright year.");
  }

  if (!authorNameRegex.test(licenseFileContent)) {
    throw new Error("LICENSE file does not contain a valid author name.");
  }

  if (!authorEmailRegex.test(licenseFileContent)) {
    throw new Error("LICENSE file does not contain a valid author email.");
  }
};
