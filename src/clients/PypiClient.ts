import * as fetchImport from 'isomorphic-unfetch';

const fetch = (fetchImport.default ||
  fetchImport) as typeof fetchImport.default;

type PypiRelease = {
  comment_text: string;
  digests: Record<string, string>;
  downloads: number;
  filename: string;
  has_sig: boolean;
  md5_digest: string;
  packagetype: string;
  python_version: string;
  requires_python: string | null;
  size: number;
  upload_time: string;
  upload_time_iso_8601: string;
  url: string;
  yanked: boolean;
  yanked_reason: string | null;
};

export type PypiManifest = {
  info: {
    author: string;
    author_email: string;
    bugtrack_url: string | null;
    classifiers: string[];
    description: string;
    description_content_type: string;
    docs_url: string | null;
    download_url: string;
    downloads: {
      last_day: number;
      last_month: number;
      last_week: number;
    };
    home_page: string;
    keywords: string;
    license: string;
    maintainer: string;
    maintainer_email: string;
    name: string;
    package_url: string;
    platform: string;
    project_url: string;
    project_urls: Record<string, string>;
    release_url: string;
    requires_dist: string[];
    requires_python: string;
    summary: string;
    version: string;
    yanked: boolean;
    yanked_reason: string | null;
  };
  last_serial: number;
  releases: Record<string, PypiRelease[]>;
};

export default class PypiClient {
  constructor(public baseURL = 'https://pypi.org/pypi') {}

  async getPackageInfo(packageName: string): Promise<PypiManifest | null> {
    let response;
    try {
      response = await fetch(`${this.baseURL}/${packageName}/json`);
      const details = await response.json();
      return details as PypiManifest;
    } catch (error) {
      console.log(error);

      return null;
    }
  }
}
