"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.howOutOfDate = exports.minVersion = exports.versionSatisfiesRanges = void 0;
const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*))*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/;
function cleanRange(range) {
    return range.trim();
}
function lessThan(a, b) {
    return a < b;
}
function lessThanEqualTo(a, b) {
    return a <= b;
}
function greaterThan(a, b) {
    return a > b;
}
function greaterThanOrEqualTo(a, b) {
    return a >= b;
}
function equalTo(a, b) {
    return a === b;
}
function getComparator(operator) {
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
function coerceToSemver(version) {
    if (version && (version.match(/\./g) || []).length < 2) {
        return `${version}.0`;
    }
    return version;
}
function getVersionParts(version) {
    const parts = semverRegex.exec(version);
    if (!parts) {
        return [0, 0, 0];
    }
    return [Number(parts[1]), Number(parts[2]), Number(parts[3])];
}
function createSimplifiedVersion(version) {
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
function versionSatisfiesRange(version, range) {
    const [operator, rangeVersion] = cleanRange(range).split(' ');
    const comparator = getComparator(operator);
    const versionSimplified = createSimplifiedVersion(version);
    const rangeVersionSimplified = createSimplifiedVersion(coerceToSemver(rangeVersion));
    if (!versionSimplified || !rangeVersionSimplified) {
        return false;
    }
    return comparator(versionSimplified, rangeVersionSimplified);
}
function isVersionParseable(version) {
    return semverRegex.exec(version) !== null;
}
function versionSatisfiesRanges(version, ranges) {
    if (!isVersionParseable(coerceToSemver(version))) {
        return false;
    }
    return ranges
        .split(',')
        .every((range) => versionSatisfiesRange(coerceToSemver(version), range));
}
exports.versionSatisfiesRanges = versionSatisfiesRanges;
function minVersion(versions) {
    return (versions
        .filter((v) => isVersionParseable(coerceToSemver(v)))
        .sort((a, b) => createSimplifiedVersion(coerceToSemver(a)) -
        createSimplifiedVersion(coerceToSemver(b)))
        .shift() ||
        versions.pop() ||
        '');
}
exports.minVersion = minVersion;
function howOutOfDate(currentVersion, latestVersion) {
    if (currentVersion === latestVersion) {
        return 'none';
    }
    const coercedCurrentVersion = coerceToSemver(currentVersion);
    const coercedLatestVersion = coerceToSemver(latestVersion);
    if (!isVersionParseable(coercedCurrentVersion) ||
        !isVersionParseable(coercedLatestVersion)) {
        return 'undetermined';
    }
    const [currMajor, currMinor, currPatch] = getVersionParts(coercedCurrentVersion);
    const [latestMajor, latestMinor, latestPatch] = getVersionParts(coercedLatestVersion);
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
    if (createSimplifiedVersion(coercedCurrentVersion) >
        createSimplifiedVersion(coercedLatestVersion)) {
        return 'none';
    }
    return 'undetermined';
}
exports.howOutOfDate = howOutOfDate;
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
