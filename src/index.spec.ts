import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import * as core from "@actions/core";
import { run } from "@/index";

describe("testing entire action run with mocks", () => {
  const ENV_ORIGINAL = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ENV_ORIGINAL }; // Make a copy
    jest.mock("@actions/core", () => ({
      setFailed: jest.fn(),
    }));
  });

  afterAll(() => {
    process.env = ENV_ORIGINAL; // Restore old environment
  });

  describe("positive tests", () => {});
  describe("negative tests", () => {
    describe("missing env vars", () => {
      it("GITHUB_REF is missing", () => {
        process.env.AUTHOR_NAME = "Markus Kurzmann";
        process.env.AUTHOR_EMAIL = "markus@kurzmann.io";
        expect(run).toThrow("asdf")
       // expect(core.setFailed).toHaveBeenCalledWith("adsf");
      });
    });
  });
});
