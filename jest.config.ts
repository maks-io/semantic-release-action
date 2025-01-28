import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
  preset: "ts-jest",
  verbose: true,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
};

export default config;
