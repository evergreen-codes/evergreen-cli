"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const queryRegistry = (0, tslib_1.__importStar)(require("query-registry"));
const Registry_1 = (0, tslib_1.__importDefault)(require("./Registry"));
class YarnRegistry extends Registry_1.default {
    getEcosystem() {
        return 'yarn';
    }
    async getPackageInfo(packageName, versions) {
        try {
            const manifest = await queryRegistry.getPackageManifest({
                name: packageName,
            });
            if (!manifest) {
                return this.getPackageInfoForFork();
            }
            const securityVulnerabilities = await this.githubClient.getRelevantPackageVulnerabilities(this.getEcosystem(), packageName, versions);
            return {
                latestVersion: manifest.version,
                latestPublishDate: new Date(manifest.createdAt),
                license: manifest.license || '',
                securityVulnerabilities,
            };
        }
        catch (error) {
            console.log(error);
            return this.getPackageInfoForFork();
        }
    }
}
exports.default = YarnRegistry;
