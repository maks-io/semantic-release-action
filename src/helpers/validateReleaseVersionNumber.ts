import * as fs from "node:fs";
import semver from "semver";
import { execSync } from "child_process";
import { EnvVarManager } from "@/env/envVarManager";

export const validateReleaseVersionNumber = () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const packageName = packageJson.name;
  const packageVersion = packageJson.version;
  const newTag = EnvVarManager.getEnvVar("GITHUB_REF")
    .split("/")
    .pop() as string;

  const versionFromNewTag = newTag.replace("refs/tags/RELEASE-", "");

  if (!packageVersion) {
    throw new Error("package.json does not contain a version field.");
  }

  if (packageVersion !== versionFromNewTag) {
    throw new Error(
      `The version in package.json (${packageVersion}) does not match the version from the tag (${versionFromNewTag}).`,
    );
  }

  let latestNpmVersion;
  try {
    // Attempt to get the latest version from npm
    latestNpmVersion = execSync(`npm show ${packageName} version`)
      .toString()
      .trim();
  } catch (error) {
    console.log(
      "No version found on npm registry. Assuming this is the first release.",
    );
    latestNpmVersion = null;
  }

  if (latestNpmVersion) {
    const versionDifference = semver.diff(versionFromNewTag, latestNpmVersion);
    if (
      !versionDifference ||
      !["major", "minor", "patch"].includes(versionDifference)
    ) {
      throw new Error(
        `Invalid version increment: ${versionFromNewTag} is not a valid successor of ${latestNpmVersion}.`,
      );
    }
  } else {
    // TODO since were assuming it is the first version it cant be something like 1.0.1
  }
};
