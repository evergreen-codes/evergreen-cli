import * as queryRegistry from 'query-registry';
import { PackageInfo, Ecosystem } from '../types';
import Registry from './Registry';

export default class YarnRegistry extends Registry {
  getEcosystem(): Ecosystem {
    return 'yarn';
  }

  async getPackageInfo(
    packageName: string,
    versions: string[]
  ): Promise<PackageInfo> {
    try {
      const manifest = await queryRegistry.getPackageManifest({
        name: packageName,
      });

      if (!manifest) {
        return this.getPackageInfoForFork();
      }

      const securityVulnerabilities =
        await this.githubClient.getRelevantPackageVulnerabilities(
          this.getEcosystem(),
          packageName,
          versions
        );

      return {
        latestVersion: manifest.version,
        latestPublishDate: new Date(manifest.createdAt),
        license: manifest.license || '',
        securityVulnerabilities,
      };
    } catch (error) {
      console.log(error);
      return this.getPackageInfoForFork();
    }
  }
}
