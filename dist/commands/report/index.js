"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const fs = (0, tslib_1.__importStar)(require("fs"));
const csv_writer_1 = require("csv-writer");
const generateReport_1 = (0, tslib_1.__importDefault)(require("../../reporter/generateReport"));
const configuration_1 = require("../../utils/configuration");
class Report extends core_1.Command {
    async outputReport(config, report) {
        const summaryCsvFields = {
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
        const riskAssessmentCsvFields = {
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
        const licenseViolationsCsvFields = {
            packageName: 'Package Name',
            ecosystem: 'Ecosystem',
            license: 'License',
        };
        const securityViolationsCsvFields = {
            packageName: 'Package Name',
            ecosystem: 'Ecosystem',
            knownVulnerabilitiesCount: 'Number of Known Vulnerabilities',
            urls: 'Vulnerability URLS',
        };
        const criticalDependenciesCsvFields = {
            packageName: 'Package Name',
            ecosystem: 'Ecosystem',
            minimumVersion: 'Minimum Project Version',
            usagePercentile: 'Usage Percentile',
            knownEOLDate: 'Known EOL Date',
            notes: 'Notes',
        };
        fs.mkdirSync(config.reportOutputDirectory, { recursive: true });
        fs.writeFileSync(`${config.reportOutputDirectory}/fullReport.json`, JSON.stringify(report, null, 2));
        fs.writeFileSync(`${config.reportOutputDirectory}/details.json`, JSON.stringify(report.details, null, 2));
        fs.writeFileSync(`${config.reportOutputDirectory}/metadata.json`, JSON.stringify(report.metadata, null, 2));
        const csvSummaryWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: `${config.reportOutputDirectory}/summary.csv`,
            header: Object.entries(summaryCsvFields).map(([id, title]) => ({
                id,
                title,
            })),
        });
        const csvRiskWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: `${config.reportOutputDirectory}/riskAssessment.csv`,
            header: Object.entries(riskAssessmentCsvFields).map(([id, title]) => ({
                id,
                title,
            })),
        });
        const csvLicenseWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: `${config.reportOutputDirectory}/licenseViolations.csv`,
            header: Object.entries(licenseViolationsCsvFields).map(([id, title]) => ({
                id,
                title,
            })),
        });
        const csvSecurityWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: `${config.reportOutputDirectory}/securityViolations.csv`,
            header: Object.entries(securityViolationsCsvFields).map(([id, title]) => ({
                id,
                title,
            })),
        });
        const csvCriticalDependenciesWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: `${config.reportOutputDirectory}/criticalDependencies.csv`,
            header: Object.entries(criticalDependenciesCsvFields).map(([id, title]) => ({
                id,
                title,
            })),
        });
        await csvSummaryWriter.writeRecords(report.summary);
        await csvRiskWriter.writeRecords(report.riskAssessment);
        await csvLicenseWriter.writeRecords(report.licenseViolations);
        await csvSecurityWriter.writeRecords(report.securityViolations);
        await csvCriticalDependenciesWriter.writeRecords(report.criticalDependencies);
    }
    async run() {
        const inputConfiguration = JSON.parse(fs.readFileSync('.evergreenrc.json').toString());
        const configuration = (0, configuration_1.validateConfiguration)(inputConfiguration);
        const report = await (0, generateReport_1.default)(configuration);
        await this.outputReport(configuration, report);
    }
}
exports.default = Report;
Report.description = 'Run evergreen report';
Report.examples = [`$ evergreen report`];
Report.flags = {};
Report.args = [];
