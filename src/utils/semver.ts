import { OutOfDateDistance } from '../types';

const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*))*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/;

function cleanRange(range: string) {
  return range.trim();
}

function lessThan(a: number, b: number) {
  return a < b;
}

function lessThanEqualTo(a: number, b: number) {
  return a <= b;
}

function greaterThan(a: number, b: number) {
  return a > b;
}

function greaterThanOrEqualTo(a: number, b: number) {
  return a >= b;
}

function equalTo(a: number, b: number) {
  return a === b;
}

function getComparator(operator: string) {
  switch (operator) {
    case '<':
      return lessThan;
    case '<=':
      return lessThanEqualTo;
    case '>':
      return greaterThan;
    case '>=':
      return greaterThanOrEqualTo;
    case '=':
      return equalTo;
    default:
      throw new Error(`Unrecognized operator ${operator}`);
  }
}

function coerceToSemver(version: string) {
  if (version && (version.match(/\./g) || []).length < 2) {
    return `${version}.0`;
  }

  return version;
}

function getVersionParts(version: string) {
  const parts = semverRegex.exec(version);
  if (!parts) {
    return [0, 0, 0];
  }

  return [Number(parts[1]), Number(parts[2]), Number(parts[3])];
}

function createSimplifiedVersion(version: string) {
  const versionParts = getVersionParts(version);
  if (!versionParts) {
    return 0;
  }

  let versionSimplified = 0;
  for (let i = 0; i < 3; i += 1) {
    versionSimplified += versionParts[i] * 10 ** ((3 - i) * 5);
  }

  return versionSimplified;
}

function versionSatisfiesRange(version: string, range: string) {
  const [operator, rangeVersion] = cleanRange(range).split(' ');
  const comparator = getComparator(operator);
  const versionSimplified = createSimplifiedVersion(version);
  const rangeVersionSimplified = createSimplifiedVersion(
    coerceToSemver(rangeVersion)
  );
  if (!versionSimplified || !rangeVersionSimplified) {
    return false;
  }

  return comparator(versionSimplified, rangeVersionSimplified);
}

function isVersionParseable(version: string) {
  return semverRegex.exec(version) !== null;
}

export function versionSatisfiesRanges(
  version: string,
  ranges: string
): boolean {
  if (!isVersionParseable(coerceToSemver(version))) {
    return false;
  }

  return ranges
    .split(',')
    .every((range) => versionSatisfiesRange(coerceToSemver(version), range));
}

export function minVersion(versions: string[]): string {
  return (
    versions
      .filter((v) => isVersionParseable(coerceToSemver(v)))
      .sort(
        (a, b) =>
          createSimplifiedVersion(coerceToSemver(a)) -
          createSimplifiedVersion(coerceToSemver(b))
      )
      .shift() ||
    versions.pop() ||
    ''
  );
}

export function howOutOfDate(
  currentVersion: string,
  latestVersion: string
): OutOfDateDistance {
  if (currentVersion === latestVersion) {
    return 'none';
  }

  const coercedCurrentVersion = coerceToSemver(currentVersion);
  const coercedLatestVersion = coerceToSemver(latestVersion);
  if (
    !isVersionParseable(coercedCurrentVersion) ||
    !isVersionParseable(coercedLatestVersion)
  ) {
    return 'undetermined';
  }

  const [currMajor, currMinor, currPatch] = getVersionParts(
    coercedCurrentVersion
  );
  const [latestMajor, latestMinor, latestPatch] =
    getVersionParts(coercedLatestVersion);
  if (currMajor < latestMajor - 1) {
    return 'multiple_major';
  }

  if (currMajor < latestMajor) {
    return 'major';
  }

  if (currMinor < latestMinor) {
    return 'minor';
  }

  if (currPatch < latestPatch) {
    return 'patch';
  }

  if (
    createSimplifiedVersion(coercedCurrentVersion) >
    createSimplifiedVersion(coercedLatestVersion)
  ) {
    return 'none';
  }

  return 'undetermined';
}

// Tests
// console.log('3.1.2', '> 3.1.1', versionSatisfiesRanges('3.1.2', '> 3.1.1'), true)
// console.log('3.1.2', '> 3.1.3', versionSatisfiesRanges('3.1.2', '> 3.1.3'), false)
// console.log('4.1.2', '> 3.1.1', versionSatisfiesRanges('4.1.2', '> 3.1.1'), true)
// console.log('3.1.1', '>= 3.1.1', versionSatisfiesRanges('3.1.1', '>= 3.1.1'), true)
// console.log('3.1.1', '> 3.1.1', versionSatisfiesRanges('3.1.1', '> 3.1.1'), false)
// console.log('3.1.2', '>= 3.1.1', versionSatisfiesRanges('3.1.2', '>= 3.1.1'), true)
// console.log('3.1.0', '>= 3.1.1', versionSatisfiesRanges('3.1.0', '>= 3.1.1'), false)
// console.log('3.3.2', '< 3.1.1', versionSatisfiesRanges('3.3.2', '< 3.1.1'), false)
// console.log('3.1.2', '< 3.1.1', versionSatisfiesRanges('3.1.2', '< 3.1.1'), false)
// console.log('10.2.2', '> 3.1.1', versionSatisfiesRanges('10.2.2', '> 3.1.1'), true)
// console.log('10.2.2', '> 3.1.1, <= 11.2.1', versionSatisfiesRanges('10.2.2', '> 3.1.1, <= 11.2.1'), true)
// console.log('12.2.2', '> 3.1.1, <= 11.2.1', versionSatisfiesRanges('12.2.2', '> 3.1.1, <= 11.2.1'), false)
