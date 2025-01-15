import core from "@actions/core";
import { execSync } from "child_process";

export const releaseToNpmRegistry = () => {
  const npmToken = core.getInput("npm-token");

  execSync(`npm set //registry.npmjs.org/:_authToken=${npmToken}`);
  execSync("npm publish");
};
