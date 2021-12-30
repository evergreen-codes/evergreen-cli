import { Ecosystem } from '../types';
declare type LibrariesIOVersion = {
    number: string;
    published_at: string;
};
declare type LibrariesIOManifest = {
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
export default class LibrariesIOClient {
    baseURL: string;
    rateLimitWaitTime: number;
    constructor(baseURL?: string, rateLimitWaitTime?: number);
    private mapEcosystem;
    getPackageInfo(ecosystem: Ecosystem, packageName: string): Promise<LibrariesIOManifest | null>;
}
export {};
