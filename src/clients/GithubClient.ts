import { graphql } from '@octokit/graphql';
import { Ecosystem, SecurityVulnerability } from '../types';
import { versionSatisfiesRanges } from '../utils/semver';

type SecurityInfo = {
  securityVulnerabilities: {
    nodes: Array<{
      vulnerableVersionRange: string;
      updatedAt: string;
      severity: string;
      advisory: {
        withdrawnAt: string | null;
        notificationsPermalink: string;
      };
    }>;
  };
};

export default class GithubClient {
  private graphqlClient: typeof graphql;

  constructor(token: string) {
    this.graphqlClient = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  private mapEcosystemToGithub(ecosystem: Ecosystem): string {
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

  private constructQuery(ecosystem: Ecosystem, packageName: string) {
    return `
    {
        securityVulnerabilities(ecosystem: ${this.mapEcosystemToGithub(
          ecosystem
        )}, package: "${packageName}", first: 100) {
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

  async getRelevantPackageVulnerabilities(
    ecosystem: Ecosystem,
    packageName: string,
    versions: string[]
  ): Promise<SecurityVulnerability[]> {
    try {
      const data = await this.graphqlClient<SecurityInfo>(
        this.constructQuery(ecosystem, packageName)
      );
      return data.securityVulnerabilities.nodes
        .filter(
          (node) =>
            !node.advisory.withdrawnAt &&
            [...versions].some((version) =>
              versionSatisfiesRanges(version, node.vulnerableVersionRange)
            )
        )
        .map((node) => ({
          vulnerableRange: node.vulnerableVersionRange,
          severity: node.severity,
          url: node.advisory.notificationsPermalink,
        }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
