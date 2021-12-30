import AndroidxTechClient from '../clients/AndroidxTechClient';
import { PackageInfo, Ecosystem } from '../types';
import Registry from './Registry';
import LibrariesIOClient from '../clients/LibrariesIOClient';

const androidPackageLicenses: Record<string, string> = {
  'com.google.android.gms': 'Android Software Development Kit License',
  'com.google.firebase': 'Android Software Development Kit License',
  'com.google.android.material': 'Apache',
  'com.google.android.play':
    'Play Core Software Development Kit Terms of Service',
};

export default class GradleRegistry extends Registry {
  private androidxTechClient = new AndroidxTechClient();

  private librariesIOClient = new LibrariesIOClient();

  getEcosystem(): Ecosystem {
    return 'gradle';
  }

  async getPackageInfo(
    packageName: string,
    versions: string[]
  ): Promise<PackageInfo> {
    const manifest = packageName.startsWith('androidx')
      ? await this.androidxTechClient.getPackageInfo(packageName)
      : await this.librariesIOClient.getPackageInfo(
          this.getEcosystem(),
          packageName
        );

    if (!manifest) {
      return this.getPackageInfoForFork({
        license: androidPackageLicenses[packageName.split(':')[0]] || '',
      });
    }

    const securityVulnerabilities =
      await this.githubClient.getRelevantPackageVulnerabilities(
        this.getEcosystem(),
        packageName,
        versions
      );

    return {
      latestVersion: manifest?.latest_stable_release_number || '',
      latestPublishDate: new Date(manifest?.latest_release_published_at || 0),
      license:
        manifest?.licenses ||
        androidPackageLicenses[packageName.split(':')[0]] ||
        '',
      securityVulnerabilities,
    };
  }
}
