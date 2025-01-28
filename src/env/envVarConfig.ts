export const envVarConfig = {
  GITHUB_REF: {
    retrieve: () => process.env.GITHUB_REF,
    transform: (rawValue: string) => rawValue,
    validate: (value: string) =>
      value !== undefined && value !== "undefined" && value.length > 2,
    invalidValueErrorMsg: `must be a provided`,
  },
  AUTHOR_NAME: {
    retrieve: () => process.env.AUTHOR_NAME,
    transform: (rawValue: string) => rawValue,
    validate: (value: string) =>
      value !== undefined && value !== "undefined" && value.length > 2,
    invalidValueErrorMsg: `must be provided`,
  },
  AUTHOR_EMAIL: {
    retrieve: () => process.env.AUTHOR_EMAIL,
    transform: (rawValue: string) => rawValue,
    validate: (value: string) => value.includes("@") && value.includes("."),
    invalidValueErrorMsg: `must be provided`,
  },
};
