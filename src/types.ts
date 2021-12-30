export type Ecosystem = 'pip' | 'yarn' | 'gradle' | 'cocoapods';
export type Environment = 'application' | 'development';
export type OutOfDateDistance =
  | 'multiple_major'
  | 'major'
  | 'minor'
  | 'patch'
  | 'undetermined'
  | 'none';

export type ApplicationDependency = {
  ecosystem: Ecosystem;
  environment: Environment;
  source: string;
  packageName: string;
  version: string;
  isForked: boolean;
};

export type SecurityVulnerability = {
  vulnerableRange: string;
  severity: string;
  url: string;
};

export type PackageInfo = {
  latestVersion: string;
  latestPublishDate: Date;
  license: string;
  maintainerCount?: number;
  securityVulnerabilities: SecurityVulnerability[];
};

export type DependencyDetail = {
  packageName: string;
  ecosystem: Ecosystem;
  versions: ApplicationDependency[];
  packageInfo: PackageInfo;
  estimatedUsage: number;
};

export type DependencySummary = {
  packageName: string;
  isForked: boolean;
  ecosystem: Ecosystem;
  isApplicationDependency: boolean;
  minimumVersion: string;
  latestReleaseVersion: string;
  latestReleaseDate: Date;
  maintainerCount?: number;
  outOfDateDistance: OutOfDateDistance;
  estimatedUsage: number;
  license: string;
  knownVulnerabilitiesCount: number;
  versionCount: number;
};

export type RiskAssessment = {
  packageName: string;
  ecosystem: Ecosystem;
  risk: number;
  criticality: number;
  freshness: number;
  maintenence: number;
  consistency: number;
  security: number;
  compliance: number;
};

export type LicenseViolation = {
  packageName: string;
  ecosystem: Ecosystem;
  license: string;
};

export type SecurityViolation = {
  packageName: string;
  ecosystem: Ecosystem;
  knownVulnerabilitiesCount: number;
  urls: string;
};

export type CriticalDependency = {
  packageName: string;
  ecosystem: string;
  minimumVersion: string;
  usagePercentile: number;
  knownEOLDate?: null;
  notes?: null;
};

export type Report = {
  metadata: {
    numberOfDependencies: number;
    numberOfSecurityVulnerabilities: number;
    averageRiskScore: number;
    numberOfNonCompliantDependencies: number;
    nonCompliantLicenses: string[];
    numberOfOutOfDateDependencies: number;
    outOfDateBreakdown: Record<OutOfDateDistance, number>;
    numberOfPotentiallyUnusedDependencies: number;
    numberOfPotentiallyUnmaintainedDependencies: number;
  };
  details: DependencyDetail[];
  summary: DependencySummary[];
  riskAssessment: RiskAssessment[];
  licenseViolations: LicenseViolation[];
  securityViolations: SecurityViolation[];
  criticalDependencies: CriticalDependency[];
};

export type ReportConfiguration = {
  ecosystem: Ecosystem;
  options: {
    projectRoot: string;
    sourceGlob: string;
  };
};

export type DependencyOverride = {
  packageName: string;
  ecosystem: Ecosystem;
  isForked?: boolean;
  isApplicationDependency?: boolean;
  minimumVersion?: string;
  latestReleaseVersion?: string;
  latestReleaseDate?: Date;
  maintainerCount?: number;
  outOfDateDistance?: OutOfDateDistance;
  estimatedUsage?: number;
  license?: string;
  knownVulnerabilitiesCount?: number;
  versionCount?: number;
};

export type InputConfiguration = {
  approvedLicenses: string[];
  reportOutputDirectory?: string;
  weights?: {
    criticalityBump?: number;
    developmentDiscount?: number;
    freshness?: number;
    maintenence?: number;
    consistency?: number;
  };
  criticialityThreshold?: number;
  reports: ReportConfiguration[];
  overrides?: DependencyOverride[];
};

export type Configuration = {
  approvedLicenses: string[];
  reportOutputDirectory: string;
  weights: {
    criticalityBump: number;
    developmentDiscount: number;
    freshness: number;
    maintenence: number;
    consistency: number;
  };
  criticialityThreshold: number;
  githubToken: string;
  reports: ReportConfiguration[];
  overrides: DependencyOverride[];
};
