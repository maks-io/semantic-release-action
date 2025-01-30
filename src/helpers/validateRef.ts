import { EnvVarManager } from "@/env/envVarManager";
import semver from "semver";

export const validateRef = () => {
  const ref = EnvVarManager.getEnvVar("GITHUB_REF");
  if (!ref) {
    // this case should actually never occur, since step 1 should have already validated all env vars
    throw new Error("GITHUB_REF not set");
  }

  if (!ref.startsWith("refs/tags/v")) {
    throw new Error(
      `This action should only run on release tag pushes. The current reference is ${ref}, but it should start with "refs/tags/v".`,
    );
  }

  const releaseVersion = ref.replace("refs/tags/v", "");

  if (!semver.valid(releaseVersion)) {
    throw new Error(
      `This action should only run on release tag pushes. The current reference is ${ref}, which does not have the shape "refs/tags/v{VALID_SEMVER}".`,
    );
  }
};
