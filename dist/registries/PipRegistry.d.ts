import { PackageInfo, Ecosystem } from '../types';
import Registry from './Registry';
export default class PipRegistry extends Registry {
    private pypiClient;
    private parseLicense;
    getEcosystem(): Ecosystem;
    getPackageInfo(packageName: string, versions: string[]): Promise<PackageInfo>;
}
