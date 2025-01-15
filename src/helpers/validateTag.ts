import { EnvVarManager } from "@/env/envVarManager";

export const validateTag = () => {
  const ref = EnvVarManager.getEnvVar("GITHUB_REF");
  if (!ref) {
    throw new Error("GITHUB_REF not set");
  }

  if (!ref.startsWith("refs/tags/RELEASE-")) {
    throw new Error(
      `This action should only run on release tag pushes. The current reference is ${ref}, but it should start with "refs/tags/RELEASE-".`,
    );
  }
};
