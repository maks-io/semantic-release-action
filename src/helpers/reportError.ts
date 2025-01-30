import * as core from "@actions/core";
import { logStep } from "@/helpers/logStep";

export const reportError = (
  error: Error,
  stepNumber: number,
  stepTitle: string,
) => {
  core.setFailed(error.message);
  logStep(stepTitle, "failed");
  throw new Error(error.message);
};
