import { Ecosystem, SecurityVulnerability } from '../types';
export default class GithubClient {
    private graphqlClient;
    constructor(token: string);
    private mapEcosystemToGithub;
    private constructQuery;
    getRelevantPackageVulnerabilities(ecosystem: Ecosystem, packageName: string, versions: string[]): Promise<SecurityVulnerability[]>;
}
