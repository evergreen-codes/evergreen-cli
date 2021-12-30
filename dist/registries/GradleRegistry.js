"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const AndroidxTechClient_1 = (0, tslib_1.__importDefault)(require("../clients/AndroidxTechClient"));
const Registry_1 = (0, tslib_1.__importDefault)(require("./Registry"));
const LibrariesIOClient_1 = (0, tslib_1.__importDefault)(require("../clients/LibrariesIOClient"));
const androidPackageLicenses = {
    'com.google.android.gms': 'Android Software Development Kit License',
    'com.google.firebase': 'Android Software Development Kit License',
    'com.google.android.material': 'Apache',
    'com.google.android.play': 'Play Core Software Development Kit Terms of Service',
};
class GradleRegistry extends Registry_1.default {
    constructor() {
        super(...arguments);
        this.androidxTechClient = new AndroidxTechClient_1.default();
        this.librariesIOClient = new LibrariesIOClient_1.default();
    }
    getEcosystem() {
        return 'gradle';
    }
    async getPackageInfo(packageName, versions) {
        const manifest = packageName.startsWith('androidx')
            ? await this.androidxTechClient.getPackageInfo(packageName)
            : await this.librariesIOClient.getPackageInfo(this.getEcosystem(), packageName);
        if (!manifest) {
            return this.getPackageInfoForFork({
                license: androidPackageLicenses[packageName.split(':')[0]] || '',
            });
        }
        const securityVulnerabilities = await this.githubClient.getRelevantPackageVulnerabilities(this.getEcosystem(), packageName, versions);
        return {
            latestVersion: (manifest === null || manifest === void 0 ? void 0 : manifest.latest_stable_release_number) || '',
            latestPublishDate: new Date((manifest === null || manifest === void 0 ? void 0 : manifest.latest_release_published_at) || 0),
            license: (manifest === null || manifest === void 0 ? void 0 : manifest.licenses) ||
                androidPackageLicenses[packageName.split(':')[0]] ||
                '',
            securityVulnerabilities,
        };
    }
}
exports.default = GradleRegistry;
