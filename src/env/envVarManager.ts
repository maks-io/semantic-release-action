import { createEnvVarManager } from "env-var-manager";

import { envVarConfig } from "@/env/envVarConfig";
import { IEnvironmentVariable } from "@/types/IEnvironmentVariable";

export const EnvVarManager = createEnvVarManager<
  IEnvironmentVariable,
  typeof envVarConfig
>(envVarConfig);
