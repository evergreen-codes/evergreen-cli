import * as fetchImport from 'isomorphic-unfetch';
import { Ecosystem } from '../types';

const fetch = (fetchImport.default ||
  fetchImport) as typeof fetchImport.default;

type LibrariesIOVersion = {
  number: string;
  published_at: string;
};

type LibrariesIOManifest = {
  dependent_repos_count: number;
  dependents_count: number;
  deprecation_reason: string | null;
  description: string;
  forks: number;
  homepage: string;
  keywords: string[];
  language: string;
  latest_download_url: string | null;
  latest_release_number: string;
  latest_release_published_at: string;
  latest_stable_release_number: string;
  latest_stable_release_published_at: string;
  license_normalized: boolean;
  licenses: string | null;
  name: string;
  normalized_licenses: string[];
  package_manager_url: string;
  platform: string;
  rank: number;
  repository_license: string;
  repository_url: string;
  stars: number;
  status: string;
  versions: LibrariesIOVersion[];
};

const sleep = (milliseconds: number) =>
  new Promise((res) => {
    setTimeout(res, milliseconds);
  });

export default class LibrariesIOClient {
  constructor(
    public baseURL = 'https://libraries.io/api',
    public rateLimitWaitTime = 61_000
  ) {}

  private mapEcosystem(ecosystem: Ecosystem): string {
    switch (ecosystem) {
      case 'cocoapods':
        return 'cocoapods';
      case 'gradle':
        return 'maven';
      default:
        throw new Error(
          `Libraries.io client doesn't support ecosystem ${ecosystem}`
        );
    }
  }

  async getPackageInfo(
    ecosystem: Ecosystem,
    packageName: string
  ): Promise<LibrariesIOManifest | null> {
    let response;
    try {
      response = await fetch(
        `${this.baseURL}/${this.mapEcosystem(ecosystem)}/${packageName}`
      );
      const details = await response.json();
      return details as LibrariesIOManifest;
    } catch (error) {
      if (response && response.status === 429) {
        console.log('Hit libraries.io rate limit, waiting...');
        await sleep(this.rateLimitWaitTime);
        return this.getPackageInfo(ecosystem, packageName);
      }

      console.log(error);

      return null;
    }
  }
}
