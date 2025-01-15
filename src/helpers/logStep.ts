// TODO:
const totalSteps = 6;

export function logStep(
  stepNumber: number,
  message: string,
  status: IStepStatus,
) {
  const statusMessage = `... ${status}!`;
  console.log(`Step ${stepNumber}/${totalSteps} - ${message}${statusMessage}`);
}
