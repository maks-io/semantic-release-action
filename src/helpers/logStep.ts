// TODO:
import { stepTitles } from "@/config/stepTitles";

const totalSteps = Object.values(stepTitles).length;
const firstStep = Object.values(stepTitles)[0];
let currentStep = 0;

export function logStep(message: string, status: IStepStatus) {
  if (message === firstStep) {
    currentStep = 1;
  } else if (status === "start") {
    currentStep++;
  }
  const statusMessage = `... ${status}!`;
  console.log(`Step ${currentStep}/${totalSteps} - ${message}${statusMessage}`);
}
