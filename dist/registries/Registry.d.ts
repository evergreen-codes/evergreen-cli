import GithubClient from '../clients/GithubClient';
import { Ecosystem, PackageInfo } from '../types';
export default abstract class Registry {
    protected githubClient: GithubClient;
    constructor(githubClient: GithubClient);
    getPackageInfoForFork(defaults?: Partial<PackageInfo>): PackageInfo;
    abstract getEcosystem(): Ecosystem;
    abstract getPackageInfo(packageName: string, versions: string[]): Promise<PackageInfo>;
}
