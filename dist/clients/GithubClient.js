"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("@octokit/graphql");
const semver_1 = require("../utils/semver");
class GithubClient {
    constructor(token) {
        this.graphqlClient = graphql_1.graphql.defaults({
            headers: {
                authorization: `token ${token}`,
            },
        });
    }
    mapEcosystemToGithub(ecosystem) {
        switch (ecosystem) {
            case 'yarn':
                return 'NPM';
            case 'pip':
                return 'PIP';
            case 'gradle':
                return 'MAVEN';
            default:
                throw new Error(`Unsupported Github ecosystem ${ecosystem}`);
        }
    }
    constructQuery(ecosystem, packageName) {
        return `
    {
        securityVulnerabilities(ecosystem: ${this.mapEcosystemToGithub(ecosystem)}, package: "${packageName}", first: 100) {
            nodes {
                vulnerableVersionRange
                updatedAt
                severity
                advisory {
                    withdrawnAt
                    notificationsPermalink
                }
            }
        }
    }
    `;
    }
    async getRelevantPackageVulnerabilities(ecosystem, packageName, versions) {
        try {
            const data = await this.graphqlClient(this.constructQuery(ecosystem, packageName));
            return data.securityVulnerabilities.nodes
                .filter((node) => !node.advisory.withdrawnAt &&
                [...versions].some((version) => (0, semver_1.versionSatisfiesRanges)(version, node.vulnerableVersionRange)))
                .map((node) => ({
                vulnerableRange: node.vulnerableVersionRange,
                severity: node.severity,
                url: node.advisory.notificationsPermalink,
            }));
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
}
exports.default = GithubClient;
