import * as core from "@actions/core";
import { EnvVarManager } from "@/env/envVarManager";
import { logStep } from "@/helpers/logStep";
import { validateRef } from "@/helpers/validateRef";
import { validateReleaseVersionNumber } from "@/helpers/validateReleaseVersionNumber";
import { releaseToNpmRegistry } from "@/helpers/releaseToNpmRegistry";
import { createGitHubRelease } from "@/helpers/createGitHubRelease";
import { reportError } from "@/helpers/reportError";
import { stepTitles } from "@/config/stepTitles";

const isJestTestRun = process.env.JEST_WORKER_ID !== undefined;

export async function run() {
  try {
    logStep(stepTitles.validEnvVars, "start");
    EnvVarManager.validateAll(true, !isJestTestRun);
    logStep(stepTitles.validEnvVars, "done");
  } catch (e: any) {
    reportError(e, 1, stepTitles.validEnvVars);
  }
  try {
    logStep(stepTitles.validTag, "start");
    validateRef();
    logStep(stepTitles.validTag, "done");
  } catch (e: any) {
    reportError(e, 2, stepTitles.validTag);
  }

  try {
    logStep(stepTitles.validReleaseNr, "start");
    validateReleaseVersionNumber();
    logStep(stepTitles.validReleaseNr, "done");
  } catch (e: any) {
    reportError(e, 3, stepTitles.validReleaseNr);
  }

  // TODO validate license
  // TODO validate static code
  // TODO run unit tests
  // TODO build

  try {
    logStep(stepTitles.releaseToNpm, "start");
    releaseToNpmRegistry();
    logStep(stepTitles.releaseToNpm, "done");
  } catch (e: any) {
    reportError(e, 4, stepTitles.releaseToNpm);
  }

  try {
    logStep(stepTitles.createGithubRelease, "start");
    createGitHubRelease();
    logStep(stepTitles.createGithubRelease, "done");
  } catch (e: any) {
    reportError(e, 5, stepTitles.createGithubRelease);
  }

  const versionFromNewTag = (
    EnvVarManager.getEnvVar("GITHUB_REF").split("/").pop() as string
  ).replace("refs/tags/v", "");

  core.setOutput("version", versionFromNewTag);
}

// only run this action automatically if we are not in a Jest test
// (since the Jest tests are calling it explicitly)
if (!isJestTestRun) {
  run();
}
