import semver from "semver";

export function isValidSemverSuccessor(
  current: string,
  candidate: string,
): boolean {
  if (!semver.valid(current) || !semver.valid(candidate)) return false;

  // Parse the versions
  const currentParsed = semver.parse(current);
  const candidateParsed = semver.parse(candidate);

  if (!currentParsed || !candidateParsed) return false;

  const {
    major: curMajor,
    minor: curMinor,
    patch: curPatch,
    prerelease: curPrerelease,
  } = currentParsed;
  const {
    major: candMajor,
    minor: candMinor,
    patch: candPatch,
    prerelease: candPrerelease,
  } = candidateParsed;

  // Handle normal release successors
  if (candMajor > curMajor)
    return candMajor === curMajor + 1 && candMinor === 0 && candPatch === 0;
  if (candMinor > curMinor)
    return (
      candMinor === curMinor + 1 && candPatch === 0 && candMajor === curMajor
    );
  if (candPatch > curPatch)
    return (
      candPatch === curPatch + 1 &&
      candMinor === curMinor &&
      candMajor === curMajor
    );

  // Handle pre-release successors within the same version
  if (
    candMajor === curMajor &&
    candMinor === curMinor &&
    candPatch === curPatch
  ) {
    return semver.gt(candidate, current);
  }

  return false;
}
