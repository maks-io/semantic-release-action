import * as fs from "node:fs";
import semver from "semver";
import { EnvVarManager } from "@/env/envVarManager";
import { getLatestNpmVersion } from "@/helpers/getLatestNpmVersion";
import { isValidSemverSuccessor } from "@/helpers/isValidSemverSuccessor";

export const validateReleaseVersionNumber = () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const packageName = packageJson.name;
  const packageVersion = packageJson.version;
  const newTag = EnvVarManager.getEnvVar("GITHUB_REF")
    .split("/")
    .pop() as string;

  // remove leading 'v':
  const versionFromNewTag = newTag.replace("v", "");

  if (!packageVersion) {
    throw new Error("package.json does not contain a version field.");
  }

  if (!semver.valid(packageVersion)) {
    throw new Error(
      `package.json version '${packageVersion}' is not a valid semver.`,
    );
  }

  if (packageVersion !== versionFromNewTag) {
    throw new Error(
      `The version in package.json (${packageVersion}) does not match the version from the tag (${versionFromNewTag}).`,
    );
  }

  let latestNpmVersion;
  try {
    // Attempt to get the latest version from npm
    latestNpmVersion = getLatestNpmVersion(packageName);
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
      !isValidSemverSuccessor(latestNpmVersion, versionFromNewTag)
    ) {
      throw new Error(
        `Invalid version increment: ${versionFromNewTag} is not a valid successor of ${latestNpmVersion}.`,
      );
    }
  } else {
    const parsed = semver.parse(versionFromNewTag);
    if (!parsed) {
      throw new Error(
        `Could not parse versionFromNewTag '${versionFromNewTag}'`,
      );
    }

    const { major, minor, patch, prerelease } = parsed;

    if (
      (major === 1 && minor === 0 && patch === 0) || // 1.0.0
      (major === 0 && minor === 1 && patch === 0) || // 0.1.0
      (major === 0 && minor === 0 && patch === 1) || // 0.0.1
      (major === 1 && minor === 0 && patch === 0 && prerelease.length > 0) // Pre-release: 1.0.0-alpha, etc.
    ) {
      // do nothing, everything's ok!
    } else {
      throw new Error(
        `We are dealing with a first release, but the desired version is '${versionFromNewTag}', while valid first versions are only '1.0.0', '0.1.0', '0.0.1', '1.0.0-alpha', etc.'`,
      );
    }
  }
};
