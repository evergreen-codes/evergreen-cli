import GithubClient from '../clients/GithubClient';
import CocoaPodsParser from '../parsers/CocoaPodsParser';
import GradleParser from '../parsers/GradleParser';
import Parser from '../parsers/Parser';
import PipParser from '../parsers/PipParser';
import YarnParser from '../parsers/YarnParser';
import CocoaPodsRegistry from '../registries/CocoaPodsRegistry';
import GradleRegistry from '../registries/GradleRegistry';
import PipRegistry from '../registries/PipRegistry';
import Registry from '../registries/Registry';
import YarnRegistry from '../registries/YarnRegistry';
import CocoaPodsSourceAnalyzer from '../sourceAnalyzers/CocoaPodsSourceAnalyzer';
import GradleSourceAnalyzer from '../sourceAnalyzers/GradleSourceAnalyzer';
import PipSourceAnalyzer from '../sourceAnalyzers/PipSourceAnalyzer';
import SourceAnalyzer from '../sourceAnalyzers/SourceAnalyzer';
import YarnSourceAnalyzer from '../sourceAnalyzers/YarnSourceAnalyzer';
import {
  ApplicationDependency,
  Configuration,
  DependencyDetail,
  DependencySummary,
  Ecosystem,
  Report,
  ReportConfiguration,
  RiskAssessment,
} from '../types';
import { isLicenseApproved } from '../utils/license';
import { howOutOfDate, minVersion } from '../utils/semver';

type Tools = {
  parser: Parser;
  registry: Registry;
  sourceAnalyzer: SourceAnalyzer;
};

let parsers: Parser[] = [];
let registries: Registry[] = [];
let sourceAnalyzers: SourceAnalyzer[] = [];

function initializeTools(configuration: Configuration) {
  const githubClient = new GithubClient(configuration.githubToken);
  parsers = [
    new CocoaPodsParser(),
    new YarnParser(),
    new PipParser(),
    new GradleParser(),
  ];

  registries = [
    new CocoaPodsRegistry(githubClient),
    new YarnRegistry(githubClient),
    new PipRegistry(githubClient),
    new GradleRegistry(githubClient),
  ];

  sourceAnalyzers = [
    new CocoaPodsSourceAnalyzer(),
    new YarnSourceAnalyzer(),
    new PipSourceAnalyzer(),
    new GradleSourceAnalyzer(),
  ];
}

function getToolsForEcosystem(ecosystem: Ecosystem): Tools {
  const parser = parsers.find((p) => p.getEcosystem() === ecosystem);
  const registry = registries.find((r) => r.getEcosystem() === ecosystem);
  const sourceAnalyzer = sourceAnalyzers.find(
    (s) => s.getEcosystem() === ecosystem
  );
  if (!parser || !registry || !sourceAnalyzer) {
    throw new Error(`Ecosystem not supported - ${ecosystem}`);
  }

  return { parser, registry, sourceAnalyzer };
}

function groupVersions(
  dependencies: ApplicationDependency[]
): Record<string, ApplicationDependency[]> {
  const groupedDependencies: Record<string, ApplicationDependency[]> = {};
  dependencies.forEach((dependency) => {
    if (!groupedDependencies[dependency.packageName]) {
      groupedDependencies[dependency.packageName] = [];
    }

    groupedDependencies[dependency.packageName].push(dependency);
  });
  return groupedDependencies;
}

function getCriticalityScore(
  configuration: Configuration,
  dependency: DependencySummary,
  allDependencies: DependencySummary[]
): number {
  const dependenciesInEcosystem = allDependencies.filter(
    (d) => d.ecosystem === dependency.ecosystem
  );
  const usageHistogram = dependenciesInEcosystem
    .map((d) => d.estimatedUsage)
    .sort((a, b) => a - b);

  return (
    Number(
      Math.max(
        usageHistogram.indexOf(dependency.estimatedUsage) /
          (usageHistogram.length - 1),
        0.1
      ).toFixed(2)
    ) *
    (dependency.isApplicationDependency
      ? 1
      : configuration.weights.developmentDiscount)
  );
}

function getFreshnessScore(dependency: DependencySummary): number {
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

function getMaintainenceScore(dependency: DependencySummary) {
  if (dependency.isForked) {
    return 0;
  }

  const oneYearAgo = new Date().setFullYear(new Date().getFullYear() - 1);
  const diff = Number(dependency.latestReleaseDate) - Number(oneYearAgo);

  return diff > 0 ? 1 : 0;
}

function getConsistencyScore(dependency: DependencySummary) {
  if (dependency.versionCount > 2) {
    return 0;
  }

  if (dependency.versionCount > 1) {
    return 0.5;
  }

  return 1;
}

function getSecurityScore(dependency: DependencySummary) {
  if (dependency.knownVulnerabilitiesCount) {
    return 0;
  }

  return 1;
}

function getComplianceScore(
  dependency: DependencySummary,
  approvedLicenses: string[]
) {
  if (
    dependency.license &&
    isLicenseApproved(dependency.license, approvedLicenses)
  ) {
    return 1;
  }

  return 0;
}

function getRiskScore(
  configuration: Configuration,
  criticality: number,
  freshness: number,
  maintenence: number,
  consistency: number,
  security: number,
  compliance: number
): number {
  if (security === 0 || compliance === 0) {
    return 1;
  }

  const health =
    configuration.weights.freshness * freshness +
    configuration.weights.maintenence * maintenence +
    configuration.weights.consistency * consistency;
  const criticalityWeight =
    configuration.weights.criticalityBump +
    configuration.weights.criticalityBump * criticality;

  return Number((criticalityWeight * (1 - health)).toFixed(2));
}

async function getDependencyDetails(
  reportConfiguration: ReportConfiguration
): Promise<DependencyDetail[]> {
  const { parser, registry, sourceAnalyzer } = getToolsForEcosystem(
    reportConfiguration.ecosystem
  );
  const dependencies = await parser.getDependencies(
    reportConfiguration.options.projectRoot
  );
  const versions = groupVersions(dependencies);
  const details: DependencyDetail[] = [];

  for await (const dependency of Object.keys(versions)) {
    const ecosystem = versions[dependency][0].ecosystem;
    console.log(`Analyzing ${ecosystem} dependency ${dependency}`);
    const packageVersions = versions[dependency].map(
      (version) => version.version
    );
    const packageInfo = await registry.getPackageInfo(
      dependency,
      packageVersions
    );
    const estimatedUsage = await sourceAnalyzer.countOccurances(
      dependency,
      reportConfiguration.options.projectRoot,
      reportConfiguration.options.sourceGlob
    );
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

function getDependencySummaries(
  dependencies: DependencyDetail[]
): DependencySummary[] {
  return dependencies.map((detail) => ({
    packageName: detail.packageName,
    ecosystem: detail.ecosystem,
    isForked: detail.versions.some((version) => version.isForked),
    isApplicationDependency: detail.versions.some(
      (version) => version.environment === 'application'
    ),
    minimumVersion: minVersion(
      detail.versions.map((version) => version.version)
    ),
    latestReleaseVersion: detail.packageInfo.latestVersion,
    latestReleaseDate: detail.packageInfo.latestPublishDate,
    maintainerCount: detail.packageInfo.maintainerCount,
    outOfDateDistance: howOutOfDate(
      minVersion(detail.versions.map((version) => version.version)),
      detail.packageInfo.latestVersion
    ),
    estimatedUsage: detail.estimatedUsage,
    license: detail.packageInfo.license,
    knownVulnerabilitiesCount:
      detail.packageInfo.securityVulnerabilities.length,
    versionCount: detail.versions.length,
  }));
}

function getRiskAssessments(
  configuration: Configuration,
  dependencies: DependencySummary[],
  approvedLicenses: string[]
): RiskAssessment[] {
  const assessments: RiskAssessment[] = [];
  for (const dependency of dependencies) {
    const criticality = getCriticalityScore(
      configuration,
      dependency,
      dependencies
    );
    const freshness = getFreshnessScore(dependency);
    const maintenence = getMaintainenceScore(dependency);
    const consistency = getConsistencyScore(dependency);
    const security = getSecurityScore(dependency);
    const compliance = getComplianceScore(dependency, approvedLicenses);
    const risk = getRiskScore(
      configuration,
      criticality,
      freshness,
      maintenence,
      consistency,
      security,
      compliance
    );

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

function getMetadata(
  configuration: Configuration,
  summary: DependencySummary[],
  riskAssessment: RiskAssessment[]
): Report['metadata'] {
  return {
    numberOfDependencies: summary.length,
    numberOfSecurityVulnerabilities: summary.reduce(
      (prev, dep) => prev + dep.knownVulnerabilitiesCount,
      0
    ),
    averageRiskScore:
      riskAssessment.reduce((prev, curr) => prev + curr.risk, 0) /
      riskAssessment.length,
    numberOfNonCompliantDependencies: summary
      .map((s) => s.license)
      .filter((l) => !isLicenseApproved(l, configuration.approvedLicenses))
      .length,
    nonCompliantLicenses: [
      ...new Set(
        summary
          .map((s) => s.license)
          .filter((l) => !isLicenseApproved(l, configuration.approvedLicenses))
      ),
    ],
    numberOfOutOfDateDependencies: summary.filter(
      (s) => s.outOfDateDistance !== 'none'
    ).length,
    outOfDateBreakdown: {
      multiple_major: summary.filter(
        (s) => s.outOfDateDistance === 'multiple_major'
      ).length,
      major: summary.filter((s) => s.outOfDateDistance === 'major').length,
      minor: summary.filter((s) => s.outOfDateDistance === 'minor').length,
      patch: summary.filter((s) => s.outOfDateDistance === 'patch').length,
      undetermined: summary.filter(
        (s) => s.outOfDateDistance === 'undetermined'
      ).length,
      none: summary.filter((s) => s.outOfDateDistance === 'none').length,
    },
    numberOfPotentiallyUnmaintainedDependencies: riskAssessment.filter(
      (r) => r.maintenence < 1
    ).length,
    numberOfPotentiallyUnusedDependencies: summary.filter(
      (s) => s.estimatedUsage === 0
    ).length,
  };
}

export function generateReportFromDetails(
  configuration: Configuration,
  details: DependencyDetail[]
): Report {
  const summary = getDependencySummaries(details).map((d) => {
    const override = configuration.overrides?.find(
      (o) => o.packageName === d.packageName && o.ecosystem === d.ecosystem
    );
    return {
      ...d,
      ...override,
    };
  });
  const riskAssessment = getRiskAssessments(
    configuration,
    summary,
    configuration.approvedLicenses
  );
  const metadata = getMetadata(configuration, summary, riskAssessment);
  const licenseViolations = summary
    .filter(
      (s) => !isLicenseApproved(s.license, configuration.approvedLicenses)
    )
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
    .map((r) => ({
      packageName: r.packageName,
      ecosystem: r.ecosystem,
      usagePercentile: r.criticality,
      minimumVersion:
        summary.find(
          (s) => s.packageName === r.packageName && s.ecosystem === r.ecosystem
        )?.minimumVersion || '',
    }));

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

export default async function generateReport(
  configuration: Configuration
): Promise<Report> {
  initializeTools(configuration);
  let details: DependencyDetail[] = [];
  for await (const reportConfiguration of configuration.reports) {
    const detail = await getDependencyDetails(reportConfiguration);
    details = [...details, ...detail];
  }

  return generateReportFromDetails(configuration, details);
}
