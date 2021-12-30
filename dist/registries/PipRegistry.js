"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const PypiClient_1 = (0, tslib_1.__importDefault)(require("../clients/PypiClient"));
const Registry_1 = (0, tslib_1.__importDefault)(require("./Registry"));
class PipRegistry extends Registry_1.default {
    constructor() {
        super(...arguments);
        this.pypiClient = new PypiClient_1.default();
    }
    parseLicense(manifest) {
        if (manifest.info.license &&
            manifest.info.license.toLocaleLowerCase() !== 'unknown') {
            return manifest.info.license;
        }
        const licenseClassifier = manifest.info.classifiers.find((c) => c.startsWith('License ::'));
        if (licenseClassifier) {
            return licenseClassifier.replace('License :: OSI Approved :: ', '');
        }
        return '';
    }
    getEcosystem() {
        return 'pip';
    }
    async getPackageInfo(packageName, versions) {
        try {
            const manifest = await this.pypiClient.getPackageInfo(packageName);
            if (!manifest) {
                return this.getPackageInfoForFork();
            }
            const securityVulnerabilities = await this.githubClient.getRelevantPackageVulnerabilities(this.getEcosystem(), packageName, versions);
            const releasedVersion = manifest.releases[manifest.info.version][0];
            return {
                latestVersion: manifest.info.version,
                latestPublishDate: new Date(releasedVersion.upload_time_iso_8601),
                license: this.parseLicense(manifest),
                securityVulnerabilities,
            };
        }
        catch (error) {
            console.log(error);
            return this.getPackageInfoForFork();
        }
    }
}
exports.default = PipRegistry;
