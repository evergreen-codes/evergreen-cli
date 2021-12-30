import { Command } from '@oclif/core';
import * as fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import generateReport from '../../reporter/generateReport';
import {
  Configuration,
  CriticalDependency,
  DependencySummary,
  InputConfiguration,
  LicenseViolation,
  Report as ReportType,
  RiskAssessment,
  SecurityViolation,
} from '../../types';
import { validateConfiguration } from '../../utils/configuration';

export default class Report extends Command {
  static description = 'Run evergreen report';

  static examples = [`$ evergreen report`];

  static flags = {};

  static args = [];

  async outputReport(config: Configuration, report: ReportType): Promise<void> {
    const summaryCsvFields: Record<keyof DependencySummary, string> = {
      packageName: 'Package Name',
      ecosystem: 'Ecosystem',
      isForked: 'Is Package Forked?',
      minimumVersion: 'Minumum Project Version',
      latestReleaseVersion: 'Latest Published Version',
      latestReleaseDate: 'Latest Publish Date',
      knownVulnerabilitiesCount: 'Number of Known Vulnerabilities',
      maintainerCount: 'Maintainer Count',
      estimatedUsage: 'Estimated Usage',
      outOfDateDistance: 'How Out of Date',
      versionCount: 'Number of Versions in Project',
      isApplicationDependency: 'Is Application Dependency?',
      license: 'License',
    };
    const riskAssessmentCsvFields: Record<keyof RiskAssessment, string> = {
      packageName: 'Package Name',
      ecosystem: 'Ecosystem',
      risk: 'Risk Score',
      criticality: 'Criticality Score',
      freshness: 'Freshness Score',
      maintenence: 'Maintenence Score',
      consistency: 'Consistency Score',
      security: 'Security Score',
      compliance: 'Compliance Score',
    };
    const licenseViolationsCsvFields: Record<keyof LicenseViolation, string> = {
      packageName: 'Package Name',
      ecosystem: 'Ecosystem',
      license: 'License',
    };
    const securityViolationsCsvFields: Record<keyof SecurityViolation, string> =
      {
        packageName: 'Package Name',
        ecosystem: 'Ecosystem',
        knownVulnerabilitiesCount: 'Number of Known Vulnerabilities',
        urls: 'Vulnerability URLS',
      };
    const criticalDependenciesCsvFields: Record<
      keyof CriticalDependency,
      string
    > = {
      packageName: 'Package Name',
      ecosystem: 'Ecosystem',
      minimumVersion: 'Minimum Project Version',
      usagePercentile: 'Usage Percentile',
      knownEOLDate: 'Known EOL Date',
      notes: 'Notes',
    };

    fs.mkdirSync(config.reportOutputDirectory, { recursive: true });
    fs.writeFileSync(
      `${config.reportOutputDirectory}/fullReport.json`,
      JSON.stringify(report, null, 2)
    );
    fs.writeFileSync(
      `${config.reportOutputDirectory}/details.json`,
      JSON.stringify(report.details, null, 2)
    );
    fs.writeFileSync(
      `${config.reportOutputDirectory}/metadata.json`,
      JSON.stringify(report.metadata, null, 2)
    );
    const csvSummaryWriter = createCsvWriter({
      path: `${config.reportOutputDirectory}/summary.csv`,
      header: Object.entries(summaryCsvFields).map(([id, title]) => ({
        id,
        title,
      })),
    });
    const csvRiskWriter = createCsvWriter({
      path: `${config.reportOutputDirectory}/riskAssessment.csv`,
      header: Object.entries(riskAssessmentCsvFields).map(([id, title]) => ({
        id,
        title,
      })),
    });
    const csvLicenseWriter = createCsvWriter({
      path: `${config.reportOutputDirectory}/licenseViolations.csv`,
      header: Object.entries(licenseViolationsCsvFields).map(([id, title]) => ({
        id,
        title,
      })),
    });
    const csvSecurityWriter = createCsvWriter({
      path: `${config.reportOutputDirectory}/securityViolations.csv`,
      header: Object.entries(securityViolationsCsvFields).map(
        ([id, title]) => ({
          id,
          title,
        })
      ),
    });
    const csvCriticalDependenciesWriter = createCsvWriter({
      path: `${config.reportOutputDirectory}/criticalDependencies.csv`,
      header: Object.entries(criticalDependenciesCsvFields).map(
        ([id, title]) => ({
          id,
          title,
        })
      ),
    });

    await csvSummaryWriter.writeRecords(report.summary);
    await csvRiskWriter.writeRecords(report.riskAssessment);
    await csvLicenseWriter.writeRecords(report.licenseViolations);
    await csvSecurityWriter.writeRecords(report.securityViolations);
    await csvCriticalDependenciesWriter.writeRecords(
      report.criticalDependencies
    );
  }

  async run(): Promise<void> {
    const inputConfiguration: InputConfiguration = JSON.parse(
      fs.readFileSync('.evergreenrc.json').toString()
    );
    const configuration = validateConfiguration(inputConfiguration);
    const report = await generateReport(configuration);
    await this.outputReport(configuration, report);
  }
}
