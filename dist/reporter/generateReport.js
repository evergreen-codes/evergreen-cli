"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportFromDetails = void 0;
const tslib_1 = require("tslib");
const GithubClient_1 = (0, tslib_1.__importDefault)(require("../clients/GithubClient"));
const CocoaPodsParser_1 = (0, tslib_1.__importDefault)(require("../parsers/CocoaPodsParser"));
const GradleParser_1 = (0, tslib_1.__importDefault)(require("../parsers/GradleParser"));
const PipParser_1 = (0, tslib_1.__importDefault)(require("../parsers/PipParser"));
const YarnParser_1 = (0, tslib_1.__importDefault)(require("../parsers/YarnParser"));
const CocoaPodsRegistry_1 = (0, tslib_1.__importDefault)(require("../registries/CocoaPodsRegistry"));
const GradleRegistry_1 = (0, tslib_1.__importDefault)(require("../registries/GradleRegistry"));
const PipRegistry_1 = (0, tslib_1.__importDefault)(require("../registries/PipRegistry"));
const YarnRegistry_1 = (0, tslib_1.__importDefault)(require("../registries/YarnRegistry"));
const CocoaPodsSourceAnalyzer_1 = (0, tslib_1.__importDefault)(require("../sourceAnalyzers/CocoaPodsSourceAnalyzer"));
const GradleSourceAnalyzer_1 = (0, tslib_1.__importDefault)(require("../sourceAnalyzers/GradleSourceAnalyzer"));
const PipSourceAnalyzer_1 = (0, tslib_1.__importDefault)(require("../sourceAnalyzers/PipSourceAnalyzer"));
const YarnSourceAnalyzer_1 = (0, tslib_1.__importDefault)(require("../sourceAnalyzers/YarnSourceAnalyzer"));
const license_1 = require("../utils/license");
const semver_1 = require("../utils/semver");
let parsers = [];
let registries = [];
let sourceAnalyzers = [];
function initializeTools(configuration) {
    const githubClient = new GithubClient_1.default(configuration.githubToken);
    parsers = [
        new CocoaPodsParser_1.default(),
        new YarnParser_1.default(),
        new PipParser_1.default(),
        new GradleParser_1.default(),
    ];
    registries = [
        new CocoaPodsRegistry_1.default(githubClient),
        new YarnRegistry_1.default(githubClient),
        new PipRegistry_1.default(githubClient),
        new GradleRegistry_1.default(githubClient),
    ];
    sourceAnalyzers = [
        new CocoaPodsSourceAnalyzer_1.default(),
        new YarnSourceAnalyzer_1.default(),
        new PipSourceAnalyzer_1.default(),
        new GradleSourceAnalyzer_1.default(),
    ];
}
function getToolsForEcosystem(ecosystem) {
    const parser = parsers.find((p) => p.getEcosystem() === ecosystem);
    const registry = registries.find((r) => r.getEcosystem() === ecosystem);
    const sourceAnalyzer = sourceAnalyzers.find((s) => s.getEcosystem() === ecosystem);
    if (!parser || !registry || !sourceAnalyzer) {
        throw new Error(`Ecosystem not supported - ${ecosystem}`);
    }
    return { parser, registry, sourceAnalyzer };
}
function groupVersions(dependencies) {
    const groupedDependencies = {};
    dependencies.forEach((dependency) => {
        if (!groupedDependencies[dependency.packageName]) {
            groupedDependencies[dependency.packageName] = [];
        }
        groupedDependencies[dependency.packageName].push(dependency);
    });
    return groupedDependencies;
}
function getCriticalityScore(configuration, dependency, allDependencies) {
    const dependenciesInEcosystem = allDependencies.filter((d) => d.ecosystem === dependency.ecosystem);
    const usageHistogram = dependenciesInEcosystem
        .map((d) => d.estimatedUsage)
        .sort((a, b) => a - b);
    return (Number(Math.max(usageHistogram.indexOf(dependency.estimatedUsage) /
        (usageHistogram.length - 1), 0.1).toFixed(2)) *
        (dependency.isApplicationDependency
            ? 1
            : configuration.weights.developmentDiscount));
}
function getFreshnessScore(dependency) {
    switch (dependency.outOfDateDistance) {
        case 'multiple_major':
            return 0;
        case 'major':
            return 0.25;
        case 'minor':
            return 0.5;
        case 'patch':
            return 0.75;
        default:
            return 1;
    }
}
function getMaintainenceScore(dependency) {
    if (dependency.isForked) {
        return 0;
    }
    const oneYearAgo = new Date().setFullYear(new Date().getFullYear() - 1);
    const diff = Number(dependency.latestReleaseDate) - Number(oneYearAgo);
    return diff > 0 ? 1 : 0;
}
function getConsistencyScore(dependency) {
    if (dependency.versionCount > 2) {
        return 0;
    }
    if (dependency.versionCount > 1) {
        return 0.5;
    }
    return 1;
}
function getSecurityScore(dependency) {
    if (dependency.knownVulnerabilitiesCount) {
        return 0;
    }
    return 1;
}
function getComplianceScore(dependency, approvedLicenses) {
    if (dependency.license &&
        (0, license_1.isLicenseApproved)(dependency.license, approvedLicenses)) {
        return 1;
    }
    return 0;
}
function getRiskScore(configuration, criticality, freshness, maintenence, consistency, security, compliance) {
    if (security === 0 || compliance === 0) {
        return 1;
    }
    const health = configuration.weights.freshness * freshness +
        configuration.weights.maintenence * maintenence +
        configuration.weights.consistency * consistency;
    const criticalityWeight = configuration.weights.criticalityBump +
        configuration.weights.criticalityBump * criticality;
    return Number((criticalityWeight * (1 - health)).toFixed(2));
}
async function getDependencyDetails(reportConfiguration) {
    const { parser, registry, sourceAnalyzer } = getToolsForEcosystem(reportConfiguration.ecosystem);
    const dependencies = await parser.getDependencies(reportConfiguration.options.projectRoot);
    const versions = groupVersions(dependencies);
    const details = [];
    for await (const dependency of Object.keys(versions)) {
        const ecosystem = versions[dependency][0].ecosystem;
        console.log(`Analyzing ${ecosystem} dependency ${dependency}`);
        const packageVersions = versions[dependency].map((version) => version.version);
        const packageInfo = await registry.getPackageInfo(dependency, packageVersions);
        const estimatedUsage = await sourceAnalyzer.countOccurances(dependency, reportConfiguration.options.projectRoot, reportConfiguration.options.sourceGlob);
        const detail = {
            packageName: dependency,
            ecosystem,
            versions: versions[dependency],
            packageInfo,
            estimatedUsage,
        };
        details.push(detail);
        console.log(`Done analyzing ${ecosystem} dependency ${dependency}`);
    }
    return details;
}
function getDependencySummaries(dependencies) {
    return dependencies.map((detail) => ({
        packageName: detail.packageName,
        ecosystem: detail.ecosystem,
        isForked: detail.versions.some((version) => version.isForked),
        isApplicationDependency: detail.versions.some((version) => version.environment === 'application'),
        minimumVersion: (0, semver_1.minVersion)(detail.versions.map((version) => version.version)),
        latestReleaseVersion: detail.packageInfo.latestVersion,
        latestReleaseDate: detail.packageInfo.latestPublishDate,
        maintainerCount: detail.packageInfo.maintainerCount,
        outOfDateDistance: (0, semver_1.howOutOfDate)((0, semver_1.minVersion)(detail.versions.map((version) => version.version)), detail.packageInfo.latestVersion),
        estimatedUsage: detail.estimatedUsage,
        license: detail.packageInfo.license,
        knownVulnerabilitiesCount: detail.packageInfo.securityVulnerabilities.length,
        versionCount: detail.versions.length,
    }));
}
function getRiskAssessments(configuration, dependencies, approvedLicenses) {
    const assessments = [];
    for (const dependency of dependencies) {
        const criticality = getCriticalityScore(configuration, dependency, dependencies);
        const freshness = getFreshnessScore(dependency);
        const maintenence = getMaintainenceScore(dependency);
        const consistency = getConsistencyScore(dependency);
        const security = getSecurityScore(dependency);
        const compliance = getComplianceScore(dependency, approvedLicenses);
        const risk = getRiskScore(configuration, criticality, freshness, maintenence, consistency, security, compliance);
        assessments.push({
            packageName: dependency.packageName,
            ecosystem: dependency.ecosystem,
            risk,
            criticality,
            freshness,
            maintenence,
            consistency,
            security,
            compliance,
        });
    }
    return assessments;
}
function getMetadata(configuration, summary, riskAssessment) {
    return {
        numberOfDependencies: summary.length,
        numberOfSecurityVulnerabilities: summary.reduce((prev, dep) => prev + dep.knownVulnerabilitiesCount, 0),
        averageRiskScore: riskAssessment.reduce((prev, curr) => prev + curr.risk, 0) /
            riskAssessment.length,
        numberOfNonCompliantDependencies: summary
            .map((s) => s.license)
            .filter((l) => !(0, license_1.isLicenseApproved)(l, configuration.approvedLicenses))
            .length,
        nonCompliantLicenses: [
            ...new Set(summary
                .map((s) => s.license)
                .filter((l) => !(0, license_1.isLicenseApproved)(l, configuration.approvedLicenses))),
        ],
        numberOfOutOfDateDependencies: summary.filter((s) => s.outOfDateDistance !== 'none').length,
        outOfDateBreakdown: {
            multiple_major: summary.filter((s) => s.outOfDateDistance === 'multiple_major').length,
            major: summary.filter((s) => s.outOfDateDistance === 'major').length,
            minor: summary.filter((s) => s.outOfDateDistance === 'minor').length,
            patch: summary.filter((s) => s.outOfDateDistance === 'patch').length,
            undetermined: summary.filter((s) => s.outOfDateDistance === 'undetermined').length,
            none: summary.filter((s) => s.outOfDateDistance === 'none').length,
        },
        numberOfPotentiallyUnmaintainedDependencies: riskAssessment.filter((r) => r.maintenence < 1).length,
        numberOfPotentiallyUnusedDependencies: summary.filter((s) => s.estimatedUsage === 0).length,
    };
}
function generateReportFromDetails(configuration, details) {
    const summary = getDependencySummaries(details).map((d) => {
        var _a;
        const override = (_a = configuration.overrides) === null || _a === void 0 ? void 0 : _a.find((o) => o.packageName === d.packageName && o.ecosystem === d.ecosystem);
        return {
            ...d,
            ...override,
        };
    });
    const riskAssessment = getRiskAssessments(configuration, summary, configuration.approvedLicenses);
    const metadata = getMetadata(configuration, summary, riskAssessment);
    const licenseViolations = summary
        .filter((s) => !(0, license_1.isLicenseApproved)(s.license, configuration.approvedLicenses))
        .map((s) => ({
        packageName: s.packageName,
        ecosystem: s.ecosystem,
        license: s.license,
    }));
    const securityViolations = details
        .filter((d) => d.packageInfo.securityVulnerabilities.length)
        .map((d) => ({
        packageName: d.packageName,
        ecosystem: d.ecosystem,
        knownVulnerabilitiesCount: d.packageInfo.securityVulnerabilities.length,
        urls: d.packageInfo.securityVulnerabilities.map((s) => s.url).join(' '),
    }));
    const criticalDependencies = riskAssessment
        .filter((r) => r.criticality >= configuration.criticialityThreshold)
        .map((r) => {
        var _a;
        return ({
            packageName: r.packageName,
            ecosystem: r.ecosystem,
            usagePercentile: r.criticality,
            minimumVersion: ((_a = summary.find((s) => s.packageName === r.packageName && s.ecosystem === r.ecosystem)) === null || _a === void 0 ? void 0 : _a.minimumVersion) || '',
        });
    });
    return {
        metadata,
        details,
        summary,
        riskAssessment,
        licenseViolations,
        securityViolations,
        criticalDependencies,
    };
}
exports.generateReportFromDetails = generateReportFromDetails;
async function generateReport(configuration) {
    initializeTools(configuration);
    let details = [];
    for await (const reportConfiguration of configuration.reports) {
        const detail = await getDependencyDetails(reportConfiguration);
        details = [...details, ...detail];
    }
    return generateReportFromDetails(configuration, details);
}
exports.default = generateReport;
