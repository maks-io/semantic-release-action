import { execSync } from "child_process";
import { EnvVarManager } from "@/env/envVarManager";

export const createGitHubRelease = () => {
  const newTag = EnvVarManager.getEnvVar("GITHUB_REF")
    .split("/")
    .pop() as string;

  const releaseNotes = execSync(
    `npx conventional-changelog-cli -p angular -r 2`,
  ).toString();

  execSync(`gh release create ${newTag} --notes "${releaseNotes}"`);
};
