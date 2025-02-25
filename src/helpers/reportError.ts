import * as core from "@actions/core";
import { logStep } from "@/helpers/logStep";

export const reportError = (message: string, error: Error) => {
  core.setFailed(error.message);
  logStep(message, "failed");
  throw new Error(error.message);
};
