export const emptyAllEnvVars = () => {
  delete process.env["GITHUB_REF"];
  delete process.env["AUTHOR_NAME"];
  delete process.env["AUTHOR_EMAIL"];
};
