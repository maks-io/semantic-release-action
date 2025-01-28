import * as core from "@actions/core";
import { logStep } from "@/helpers/logStep";
import { validateTag } from "@/helpers/validateTag";
import { validateReleaseVersionNumber } from "@/helpers/validateReleaseVersionNumber";
import { releaseToNpmRegistry } from "@/helpers/releaseToNpmRegistry";
import { createGitHubRelease } from "@/helpers/createGitHubRelease";
import { reportError } from "@/helpers/reportError";

let EnvVarManager: any;
try {
  const { EnvVarManager: EVM } = require("@/env/envVarManager");
  EnvVarManager = EVM;
} catch (e) {}

export async function run() {
  const stepTitle1 = "Validate environment variables";
  try {
    logStep(1, stepTitle1, "start");
    EnvVarManager.validateAll();
    logStep(1, stepTitle1, "done");
  } catch (e: any) {
    reportError(e, 1, stepTitle1);
  }

  const stepTitle2 = "Validate Tag";
  try {
    logStep(2, stepTitle2, "start");
    validateTag();
    logStep(2, stepTitle2, "done");
  } catch (e: any) {
    reportError(e, 2, stepTitle2);
  }

  const stepTitle3 = "Validate Release Version Number";
  try {
    logStep(3, stepTitle3, "start");
    validateReleaseVersionNumber();
    logStep(3, stepTitle3, "done");
  } catch (e: any) {
    reportError(e, 3, stepTitle3);
  }

  // TODO build
  // TODO validate license
  // TODO validate static code

  const stepTitle4 = "Release to npm Registry";
  try {
    logStep(4, stepTitle4, "start");
    releaseToNpmRegistry();
    logStep(4, stepTitle4, "done");
  } catch (e: any) {
    reportError(e, 4, stepTitle4);
  }

  const stepTitle5 = "Create GitHub Release";
  try {
    logStep(5, stepTitle5, "start");
    createGitHubRelease();
    logStep(5, stepTitle5, "done");
  } catch (e: any) {
    reportError(e, 5, stepTitle5);
  }

  const versionFromNewTag = (
    EnvVarManager.getEnvVar("GITHUB_REF").split("/").pop() as string
  ).replace("refs/tags/RELEASE-", "");

  core.setOutput("version", versionFromNewTag);
}

run();
