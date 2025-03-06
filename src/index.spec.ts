import * as fs from "node:fs";
import * as core from "@actions/core";
import * as child_process from "child_process";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { run } from "@/index";
import { validEnvFileMock } from "@/testHelpers/validEnvFileMock";
import { emptyAllEnvVars } from "@/testHelpers/emptyAllEnvVars";
import { EnvVarManager } from "@/env/envVarManager";
import * as getLatestNpmVersionObj from "@/helpers/getLatestNpmVersion";
import { PathOrFileDescriptor } from "node:fs";

jest.mock("@actions/core");
jest.mock("node:fs", () => {
  const original = jest.requireActual("node:fs") as object;
  return {
    ...original,
    readFileSync: jest.fn(),
  };
});
jest.mock("child_process", () => {
  const original = jest.requireActual("child_process") as object;
  return {
    ...original,
    execSync: jest.fn(),
  };
});

describe("testing entire action run with mocks", () => {
  const ENV_ORIGINAL = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    EnvVarManager.resetCache();
    process.env = { ...ENV_ORIGINAL, ...validEnvFileMock };
  });

  afterEach(() => {
    process.env = ENV_ORIGINAL; // Restore old environment
  });

  describe("positive tests", () => {});
  describe("negative tests", () => {
    describe("missing env vars", () => {
      beforeEach(emptyAllEnvVars);

      it("GITHUB_REF is missing", async () => {
        process.env.AUTHOR_NAME = "Markus Kurzmann";
        process.env.AUTHOR_EMAIL = "markus@kurzmann.io";

        const expectedErrorMsg = /env-var-manager - validating environment variables failed/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("AUTHOR_NAME is missing", async () => {
        process.env.GITHUB_REF = "SOME_TAG";
        process.env.AUTHOR_EMAIL = "markus@kurzmann.io";

        const expectedErrorMsg = /env-var-manager - validating environment variables failed/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("AUTHOR_EMAIL is missing", async () => {
        process.env.GITHUB_REF = "SOME_TAG";
        process.env.AUTHOR_NAME = "Markus Kurzmann";

        const expectedErrorMsg = /env-var-manager - validating environment variables failed/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
    describe("invalid env vars", () => {
      beforeEach(emptyAllEnvVars);

      it("AUTHOR_EMAIL is invalid", async () => {
        process.env.GITHUB_REF = "SOME_TAG";
        process.env.AUTHOR_NAME = "Markus Kurzmann";
        process.env.AUTHOR_EMAIL = "NOT_A_VALID_EMAIL";

        const expectedErrorMsg = /env-var-manager - validating environment variables failed/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
    describe("invalid ref", () => {
      beforeEach(emptyAllEnvVars);

      it("ref is refs/tags/1.2.3", async () => {
        process.env.GITHUB_REF = "refs/tags/1.2.3";
        process.env.AUTHOR_NAME = "Markus Kurzmann";
        process.env.AUTHOR_EMAIL = "markus@kurzmann.io";

        const expectedErrorMsg = /This action should only run on release tag pushes./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("ref is refs/tags/v-1.2.3", async () => {
        process.env.GITHUB_REF = "refs/tags/v-1.2.3";
        process.env.AUTHOR_NAME = "Markus Kurzmann";
        process.env.AUTHOR_EMAIL = "markus@kurzmann.io";

        const expectedErrorMsg = /This action should only run on release tag pushes./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("ref is refs/tags/v_1.2.3", async () => {
        process.env.GITHUB_REF = "refs/tags/v_1.2.3"; // has underscore!
        process.env.AUTHOR_NAME = "Markus Kurzmann";
        process.env.AUTHOR_EMAIL = "markus@kurzmann.io";

        const expectedErrorMsg = /This action should only run on release tag pushes./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("ref is refs/heads/v1.2.3", async () => {
        process.env.GITHUB_REF = "refs/heads/v1.2.3";
        process.env.AUTHOR_NAME = "Markus Kurzmann";
        process.env.AUTHOR_EMAIL = "markus@kurzmann.io";

        const expectedErrorMsg = /This action should only run on release tag pushes./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("ref is refs/remotes/v1.2.3", async () => {
        process.env.GITHUB_REF = "refs/remotes/v1.2.3";
        process.env.AUTHOR_NAME = "Markus Kurzmann";
        process.env.AUTHOR_EMAIL = "markus@kurzmann.io";

        const expectedErrorMsg = /This action should only run on release tag pushes./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
    describe("invalid release version number", () => {
      it("cannot read package.json file", async () => {
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          throw new Error("Could not read file");
        });

        const expectedErrorMsg = /Could not read file/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("package.json file has no version field defined", async () => {
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-package", description: "Some description" });
        });

        const expectedErrorMsg = /package.json does not contain a version field./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("package.json field does not hold a valid semver", async () => {
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "invalid-semver" });
        });

        const expectedErrorMsg = /is not a valid semver./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("tag release version + package.json version do not match", async () => {
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "1.2.4" });
        });

        const expectedErrorMsg = /does not match the version from the tag/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("release has previous version, but desired version is not a valid successor (1)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.2.3";
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-very-unique-package-that-does-not-exist-yet", description: "Some description", version: "1.2.3" });
        });
        jest.spyOn(getLatestNpmVersionObj, "getLatestNpmVersion").mockImplementation(() => {
          return "1.0.0";
        });

        const expectedErrorMsg = /is not a valid successor of/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("release has previous version, but desired version is not a valid successor (2)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.2.3";
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-very-unique-package-that-does-not-exist-yet", description: "Some description", version: "1.2.3" });
        });
        jest.spyOn(getLatestNpmVersionObj, "getLatestNpmVersion").mockImplementation(() => {
          return "1.2.3";
        });

        const expectedErrorMsg = /is not a valid successor of/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("release has previous version, but desired version is not a valid successor (3)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.2.3";
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-very-unique-package-that-does-not-exist-yet", description: "Some description", version: "1.2.3" });
        });
        jest.spyOn(getLatestNpmVersionObj, "getLatestNpmVersion").mockImplementation(() => {
          return "1.2.4";
        });

        const expectedErrorMsg = /is not a valid successor of/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("release has no previous versions, but desired version is not a valid 1st version number (1)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.2.3";
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-very-unique-package-that-does-not-exist-yet", description: "Some description", version: "1.2.3" });
        });

        const expectedErrorMsg = /We are dealing with a first release, but the desired version is/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("release has no previous versions, but desired version is not a valid 1st version number (2)", async () => {
        process.env.GITHUB_REF = "refs/tags/v0.5.0";
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-very-unique-package-that-does-not-exist-yet", description: "Some description", version: "0.5.0" });
        });

        const expectedErrorMsg = /We are dealing with a first release, but the desired version is/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("release has no previous versions, but desired version is not a valid 1st version number (3)", async () => {
        process.env.GITHUB_REF = "refs/tags/v0.0.2";
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          return JSON.stringify({ name: "some-very-unique-package-that-does-not-exist-yet", description: "Some description", version: "0.0.2" });
        });

        const expectedErrorMsg = /We are dealing with a first release, but the desired version is/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
    describe("invalid license", () => {
      it("cannot read LICENSE file", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "1.0.0" });
        });
        jest.spyOn(fs, "readFileSync").mockImplementation(() => {
          throw new Error("Could not read file");
        });

        const expectedErrorMsg = /Could not read file/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("LICENSE file has no valid copyright year (1)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "1.0.0" });
        });
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return "Copyright 2024 Markus Kurzmann <markus@kurzmann.io>\netc etc etc...";
        });

        const expectedErrorMsg = /LICENSE file does not contain a valid copyright year./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("LICENSE file has no valid copyright year (2)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "1.0.0" });
        });
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return "Markus Kurzmann <markus@kurzmann.io>\netc etc etc...";
        });

        const expectedErrorMsg = /LICENSE file does not contain a valid copyright year./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("LICENSE file has no valid author name (1)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "1.0.0" });
        });
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          const currentYear = new Date().getFullYear();
          return `Copyright ${currentYear} Some Author <markus@kurzmann.io>\netc etc etc...`;
        });

        const expectedErrorMsg = /LICENSE file does not contain a valid author name./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("LICENSE file has no valid author name (2)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "1.0.0" });
        });
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          const currentYear = new Date().getFullYear();
          return `Copyright ${currentYear} <markus@kurzmann.io>\netc etc etc...`;
        });

        const expectedErrorMsg = /LICENSE file does not contain a valid author name./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("LICENSE file has no valid author email (1)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "1.0.0" });
        });
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          const currentYear = new Date().getFullYear();
          return `Copyright ${currentYear} Markus Kurzmann <somewrong@email.com>\netc etc etc...`;
        });

        const expectedErrorMsg = /LICENSE file does not contain a valid author email./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("LICENSE file has no valid author email (2)", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          return JSON.stringify({ name: "some-package", description: "Some description", version: "1.0.0" });
        });
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
          const currentYear = new Date().getFullYear();
          return `Copyright ${currentYear} Markus Kurzmann\netc etc etc...`;
        });

        const expectedErrorMsg = /LICENSE file does not contain a valid author email./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
    describe("install", () => {
      it("Install fails", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        const packageJsonMock = { name: "some-package", description: "Some description", version: "1.0.0" };
        jest.spyOn(fs, "readFileSync").mockImplementation((fileToRead: PathOrFileDescriptor) => {
          if (fileToRead === "package.json") {
            return JSON.stringify(packageJsonMock);
          } else {
            const currentYear = new Date().getFullYear();
            return `Copyright ${currentYear} Markus Kurzmann <markus@kurzmann.io>\netc etc etc...`;
          }
        });
        jest.spyOn(child_process, "execSync").mockImplementation((command: string) => {
          if (command === "npm ci") {
            const error = new Error("npm install failed") as any;
            error.status = 1; // Simulate an exit code of 1
            throw error;
          } else {
            const error = new Error("some other exec failed") as any;
            error.status = 1; // Simulate an exit code of 1
            throw error;
          }
        });

        const expectedErrorMsg = /npm install failed/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
    describe("invalid static code", () => {
      it("package.json does not have a scripts prop", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        const packageJsonMock = { name: "some-package", description: "Some description", version: "1.0.0" };
        jest.spyOn(fs, "readFileSync").mockImplementation((fileToRead: PathOrFileDescriptor) => {
          if (fileToRead === "package.json") {
            return JSON.stringify(packageJsonMock);
          } else {
            const currentYear = new Date().getFullYear();
            return `Copyright ${currentYear} Markus Kurzmann <markus@kurzmann.io>\netc etc etc...`;
          }
        });

        const expectedErrorMsg = /package.json does not contain a scripts field./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("package.json does not have a check-all script", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        const packageJsonMock = { name: "some-package", description: "Some description", version: "1.0.0", scripts: {} };
        jest.spyOn(fs, "readFileSync").mockImplementation((fileToRead: PathOrFileDescriptor) => {
          if (fileToRead === "package.json") {
            return JSON.stringify(packageJsonMock);
          } else {
            const currentYear = new Date().getFullYear();
            return `Copyright ${currentYear} Markus Kurzmann <markus@kurzmann.io>\netc etc etc...`;
          }
        });

        const expectedErrorMsg = /package.json does not contain a check-all script./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("the static code check fails", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        const packageJsonMock = { name: "some-package", description: "Some description", version: "1.0.0", scripts: { "check-all": "echo 'hello world'" } };
        jest.spyOn(fs, "readFileSync").mockImplementation((fileToRead: PathOrFileDescriptor) => {
          if (fileToRead === "package.json") {
            return JSON.stringify(packageJsonMock);
          } else {
            const currentYear = new Date().getFullYear();
            return `Copyright ${currentYear} Markus Kurzmann <markus@kurzmann.io>\netc etc etc...`;
          }
        });
        jest.spyOn(child_process, "execSync").mockImplementation((command: string) => {
          if (command === "npm ci") {
            return ""; // install succeeds
          } else {
            const error = new Error("npm run check-all failed") as any;
            error.status = 1; // Simulate an exit code of 1
            throw error;
          }
        });

        const expectedErrorMsg = /npm run check-all failed/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
    describe("invalid test run", () => {
      it("package.json does not have a test script", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        const packageJsonMock = { name: "some-package", description: "Some description", version: "1.0.0", scripts: { "check-all": "blabla" } };
        jest.spyOn(fs, "readFileSync").mockImplementation((fileToRead: PathOrFileDescriptor) => {
          if (fileToRead === "package.json") {
            return JSON.stringify(packageJsonMock);
          } else {
            const currentYear = new Date().getFullYear();
            return `Copyright ${currentYear} Markus Kurzmann <markus@kurzmann.io>\netc etc etc...`;
          }
        });

        const expectedErrorMsg = /package.json does not contain a test script./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("test run fails", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        const packageJsonMock = { name: "some-package", description: "Some description", version: "1.0.0", scripts: { "check-all": "blabla", test: "blabla" } };
        jest.spyOn(fs, "readFileSync").mockImplementation((fileToRead: PathOrFileDescriptor) => {
          if (fileToRead === "package.json") {
            return JSON.stringify(packageJsonMock);
          } else {
            const currentYear = new Date().getFullYear();
            return `Copyright ${currentYear} Markus Kurzmann <markus@kurzmann.io>\netc etc etc...`;
          }
        });

        jest.spyOn(child_process, "execSync").mockImplementation((command: string) => {
          if (command === "npm ci") {
            return ""; // all good
          } else if (command === "npm run check-all") {
            return ""; // all good
          } else {
            const error = new Error("npm run test failed") as any;
            error.status = 1; // Simulate an exit code of 1
            throw error;
          }
        });

        const expectedErrorMsg = /npm run test failed/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
    describe("invalid build run", () => {
      it("package.json does not have a build script", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        const packageJsonMock = { name: "some-package", description: "Some description", version: "1.0.0", scripts: { "check-all": "blabla", test: "blabla" } };
        jest.spyOn(fs, "readFileSync").mockImplementation((fileToRead: PathOrFileDescriptor) => {
          if (fileToRead === "package.json") {
            return JSON.stringify(packageJsonMock);
          } else {
            const currentYear = new Date().getFullYear();
            return `Copyright ${currentYear} Markus Kurzmann <markus@kurzmann.io>\netc etc etc...`;
          }
        });

        const expectedErrorMsg = /package.json does not contain a build script./i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
      it("build run fails", async () => {
        process.env.GITHUB_REF = "refs/tags/v1.0.0";
        const packageJsonMock = {
          name: "some-package",
          description: "Some description",
          version: "1.0.0",
          scripts: { "check-all": "blabla", test: "blabla", build: "blabla" },
        };
        jest.spyOn(fs, "readFileSync").mockImplementation((fileToRead: PathOrFileDescriptor) => {
          if (fileToRead === "package.json") {
            return JSON.stringify(packageJsonMock);
          } else {
            const currentYear = new Date().getFullYear();
            return `Copyright ${currentYear} Markus Kurzmann <markus@kurzmann.io>\netc etc etc...`;
          }
        });

        jest.spyOn(child_process, "execSync").mockImplementation((command: string) => {
          if (command === "npm ci") {
            return ""; // all good
          } else if (command === "npm run check-all") {
            return ""; // all good
          } else if (command === "npm run test") {
            return ""; // all good
          } else {
            const error = new Error("npm run build failed") as any;
            error.status = 1; // Simulate an exit code of 1
            throw error;
          }
        });

        const expectedErrorMsg = /npm run build failed/i;

        await expect(run()).rejects.toThrow(expectedErrorMsg);

        expect(core.setFailed).toHaveBeenCalledWith(expect.stringMatching(expectedErrorMsg));
      });
    });
  });
});
