import GithubClient from '../clients/GithubClient';
import { Ecosystem, PackageInfo } from '../types';

export default abstract class Registry {
  constructor(protected githubClient: GithubClient) {}

  getPackageInfoForFork(defaults: Partial<PackageInfo> = {}): PackageInfo {
    return {
      latestVersion: '',
      latestPublishDate: new Date(0),
      license: '',
      maintainerCount: 0,
      securityVulnerabilities: [],
      ...defaults,
    };
  }

  abstract getEcosystem(): Ecosystem;

  abstract getPackageInfo(
    packageName: string,
    versions: string[]
  ): Promise<PackageInfo>;
}
