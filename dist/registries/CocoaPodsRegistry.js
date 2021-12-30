"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const LibrariesIOClient_1 = (0, tslib_1.__importDefault)(require("../clients/LibrariesIOClient"));
const Registry_1 = (0, tslib_1.__importDefault)(require("./Registry"));
class CocoaPodsRegistry extends Registry_1.default {
    constructor() {
        super(...arguments);
        this.librariesIOClient = new LibrariesIOClient_1.default();
    }
    getEcosystem() {
        return 'cocoapods';
    }
    async getPackageInfo(packageName) {
        const manifest = await this.librariesIOClient.getPackageInfo(this.getEcosystem(), packageName);
        if (!manifest) {
            return this.getPackageInfoForFork();
        }
        return {
            latestVersion: manifest === null || manifest === void 0 ? void 0 : manifest.latest_stable_release_number,
            latestPublishDate: new Date(manifest === null || manifest === void 0 ? void 0 : manifest.latest_stable_release_published_at),
            license: (manifest === null || manifest === void 0 ? void 0 : manifest.licenses) || '',
            securityVulnerabilities: [],
        };
    }
}
exports.default = CocoaPodsRegistry;
