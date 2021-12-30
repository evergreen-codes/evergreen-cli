import * as fetchImport from 'isomorphic-unfetch';
import { parse } from 'node-html-parser';

const fetch = (fetchImport.default ||
  fetchImport) as typeof fetchImport.default;

type AndroixTechManifest = {
  licenses: string | undefined;
  latest_stable_release_number: string | undefined;
  latest_release_published_at: string | undefined;
};

export default class AndroixTechClient {
  constructor(public baseURL = 'https://androidx.tech/artifacts') {}

  async getPackageInfo(
    packageName: string
  ): Promise<AndroixTechManifest | null> {
    let response;
    try {
      const [org, artifact] = packageName.split(':');
      const [, ...orgParts] = org.split('.');
      const subOrg = orgParts.join('.');
      const url = `${this.baseURL}/${subOrg}/${artifact}`;
      response = await fetch(url);
      const details = await response.text();
      const root = parse(details);
      const anchor: HTMLAnchorElement | null = root
        .querySelectorAll('#content ul')[1]
        ?.querySelector('a') as unknown as HTMLAnchorElement | null;
      const latestVersion = anchor?.textContent;
      const latestReleaseLink = anchor?.getAttribute('href');
      let latestReleaseDate: string | undefined = new Date(0).toISOString();
      if (latestReleaseLink) {
        response = await fetch(`${url}/${latestReleaseLink}`);
        const versionDetails = await response.text();
        const root = parse(versionDetails);
        const p: HTMLParagraphElement | null = root.querySelectorAll(
          '#content p'
        )[1] as unknown as HTMLParagraphElement | null;
        latestReleaseDate = p?.textContent?.replace('Release Date: ', '');
      }

      return {
        licenses: 'Apache 2.0',
        latest_stable_release_number: latestVersion || '',
        latest_release_published_at: latestReleaseDate,
      };
    } catch (error) {
      console.log(error);

      return null;
    }
  }
}
