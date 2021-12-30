import LibrariesIOClient from '../clients/LibrariesIOClient';
import { PackageInfo, Ecosystem } from '../types';
import Registry from './Registry';

export default class CocoaPodsRegistry extends Registry {
  librariesIOClient = new LibrariesIOClient();

  getEcosystem(): Ecosystem {
    return 'cocoapods';
  }

  async getPackageInfo(packageName: string): Promise<PackageInfo> {
    const manifest = await this.librariesIOClient.getPackageInfo(
      this.getEcosystem(),
      packageName
    );

    if (!manifest) {
      return this.getPackageInfoForFork();
    }

    return {
      latestVersion: manifest?.latest_stable_release_number,
      latestPublishDate: new Date(manifest?.latest_stable_release_published_at),
      license: manifest?.licenses || '',
      securityVulnerabilities: [],
    };
  }
}
