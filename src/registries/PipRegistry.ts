import PypiClient, { PypiManifest } from '../clients/PypiClient';
import { PackageInfo, Ecosystem } from '../types';
import Registry from './Registry';

export default class PipRegistry extends Registry {
  private pypiClient = new PypiClient();

  private parseLicense(manifest: PypiManifest): string {
    if (
      manifest.info.license &&
      manifest.info.license.toLocaleLowerCase() !== 'unknown'
    ) {
      return manifest.info.license;
    }

    const licenseClassifier = manifest.info.classifiers.find((c) =>
      c.startsWith('License ::')
    );
    if (licenseClassifier) {
      return licenseClassifier.replace('License :: OSI Approved :: ', '');
    }

    return '';
  }

  getEcosystem(): Ecosystem {
    return 'pip';
  }

  async getPackageInfo(
    packageName: string,
    versions: string[]
  ): Promise<PackageInfo> {
    try {
      const manifest = await this.pypiClient.getPackageInfo(packageName);

      if (!manifest) {
        return this.getPackageInfoForFork();
      }

      const securityVulnerabilities =
        await this.githubClient.getRelevantPackageVulnerabilities(
          this.getEcosystem(),
          packageName,
          versions
        );

      const releasedVersion = manifest.releases[manifest.info.version][0];

      return {
        latestVersion: manifest.info.version,
        latestPublishDate: new Date(releasedVersion.upload_time_iso_8601),
        license: this.parseLicense(manifest),
        securityVulnerabilities,
      };
    } catch (error) {
      console.log(error);
      return this.getPackageInfoForFork();
    }
  }
}
