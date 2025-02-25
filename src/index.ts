import * as core from "@actions/core";
import { EnvVarManager } from "@/env/envVarManager";
import { logStep } from "@/helpers/logStep";
import { validateRef } from "@/helpers/validateRef";
import { validateReleaseVersionNumber } from "@/helpers/validateReleaseVersionNumber";
import { releaseToNpmRegistry } from "@/helpers/releaseToNpmRegistry";
import { createGitHubRelease } from "@/helpers/createGitHubRelease";
import { reportError } from "@/helpers/reportError";
import { stepTitles } from "@/config/stepTitles";
import { validateLicense } from "@/helpers/validateLicense";
import {validateStaticCode} from "@/helpers/validateStaticCode";

const isJestTestRun = process.env.JEST_WORKER_ID !== undefined;

export async function run() {
  try {
    logStep(stepTitles.validEnvVars, "start");
    EnvVarManager.validateAll(true, !isJestTestRun);
    logStep(stepTitles.validEnvVars, "done");
  } catch (e: any) {
    reportError(stepTitles.validEnvVars, e);
  }
  try {
    logStep(stepTitles.validTag, "start");
    validateRef();
    logStep(stepTitles.validTag, "done");
  } catch (e: any) {
    reportError(stepTitles.validTag, e);
  }

  try {
    logStep(stepTitles.validReleaseNr, "start");
    validateReleaseVersionNumber();
    logStep(stepTitles.validReleaseNr, "done");
  } catch (e: any) {
    reportError(stepTitles.validReleaseNr, e);
  }

  try {
    logStep(stepTitles.validLicense, "start");
    validateLicense();
    logStep(stepTitles.validLicense, "done");
  } catch (e: any) {
    reportError(stepTitles.validLicense, e);
  }

  try {
    logStep(stepTitles.validLicense, "start");
    validateLicense();
    logStep(stepTitles.validLicense, "done");
  } catch (e: any) {
    reportError(stepTitles.validLicense, e);
  }

  try {
    logStep(stepTitles.validStaticCode, "start");
    validateStaticCode();
    logStep(stepTitles.validStaticCode, "done");
  } catch (e: any) {
    reportError(stepTitles.validStaticCode, e);
  }

  // TODO run unit tests
  // TODO build

  try {
    logStep(stepTitles.releaseToNpm, "start");
    releaseToNpmRegistry();
    logStep(stepTitles.releaseToNpm, "done");
  } catch (e: any) {
    reportError(stepTitles.releaseToNpm, e);
  }

  try {
    logStep(stepTitles.createGithubRelease, "start");
    createGitHubRelease();
    logStep(stepTitles.createGithubRelease, "done");
  } catch (e: any) {
    reportError(stepTitles.createGithubRelease, e);
  }

  const versionFromNewTag = (
    EnvVarManager.getEnvVar("GITHUB_REF").split("/").pop() as string
  ).replace("refs/tags/v", "");

  core.setOutput("version", versionFromNewTag);
}

// only run this action automatically if we are not in a Jest test
// (since the Jest tests are calling run() explicitly)
if (!isJestTestRun) {
  run();
}
