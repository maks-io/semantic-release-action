import core from "@actions/core";
import { execSync } from "child_process";

const totalSteps = 6;

type IStepStatus = "start" | "done" | "failed";

function logStep(stepNumber: number, message: string, status: IStepStatus) {
  const statusMessage = `... ${status}!`;
  console.log(`Step ${stepNumber}/${totalSteps} - ${message}${statusMessage}`);
}

async function run() {
  try {
    // Step 1: Check if the trigger is a tag
    logStep(1, "Check if trigger is a Tag", "start");
    const ref = process.env.GITHUB_REF;
    if (!ref || !ref.startsWith("refs/tags/")) {
      logStep(1, "Check if trigger is a Tag", "failed");
      core.setFailed(
        "This action should only run on tag pushes. The current reference is not a tag. Please set the trigger to be\non:\n  push:\n    tags:\n      - 'Release-*'",
      );
      return;
    }
    logStep(1, "Check if trigger is a Tag", "done");

    // Step 2: Validate semantic versioning for the tag
    logStep(2, "Validate semantic versioning for the tag", "start");
    const semverPattern = /^refs\/tags\/Release-v(\d+\.\d+\.\d+)$/; // Pattern for tags like v1.0.0
    if (!semverPattern.test(ref)) {
      logStep(2, "Validate semantic versioning for the tag", "failed");
      core.setFailed(
        "The tag does not follow the semantic versioning format (e.g., v1.0.0).",
      );
      return;
    }
    logStep(2, "Validate semantic versioning for the tag", "done");

    // Step 3: Check if the version is a valid successor
    logStep(3, "Check if the version is a valid successor", "start");
    const tagVersion = ref.replace("refs/tags/v", ""); // Extract version number from the tag
    const latestVersion = execSync("npm show <your-package-name> version")
      .toString()
      .trim(); // Get the latest version from npm registry

    if (latestVersion) {
      const semver = require("semver");
      if (!semver.gt(tagVersion, latestVersion)) {
        logStep(3, "Check if the version is a valid successor", "failed");
        core.setFailed(
          `The tag version ${tagVersion} is not a valid successor of the latest released version ${latestVersion}.`,
        );
        return;
      }
    }
    logStep(3, "Check if the version is a valid successor", "done");

    // Step 4: Build the package before publishing
    logStep(4, "Run build command (npm run build)", "start");
    execSync("npm run build", { stdio: "inherit" });
    logStep(4, "Run build command (npm run build)", "done");

    // Step 5: Publish the package to npm
    logStep(5, "Publish the package to npm", "start");
    execSync("npm publish", { stdio: "inherit" });
    logStep(5, "Publish the package to npm", "done");

    // Step 6: Create GitHub Release
    logStep(6, "Create GitHub Release", "start");
    const releaseNotes = execSync(
      `npx conventional-changelog-cli -p angular -r 2`,
    ).toString();
    execSync(`gh release create ${tagName} --notes "${releaseNotes}"`);
    logStep(6, "Create GitHub Release", "done");

    core.setOutput("version", tagVersion);

    // Everything completed successfully
    console.log("Release process completed successfully!");
  } catch (error) {
    core.setFailed(`Error during the release process: ${error.message}`);
  }
}

run();
