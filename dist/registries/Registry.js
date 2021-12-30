"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Registry {
    constructor(githubClient) {
        this.githubClient = githubClient;
    }
    getPackageInfoForFork(defaults = {}) {
        return {
            latestVersion: '',
            latestPublishDate: new Date(0),
            license: '',
            maintainerCount: 0,
            securityVulnerabilities: [],
            ...defaults,
        };
    }
}
exports.default = Registry;
