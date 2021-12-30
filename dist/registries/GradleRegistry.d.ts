import { PackageInfo, Ecosystem } from '../types';
import Registry from './Registry';
export default class GradleRegistry extends Registry {
    private androidxTechClient;
    private librariesIOClient;
    getEcosystem(): Ecosystem;
    getPackageInfo(packageName: string, versions: string[]): Promise<PackageInfo>;
}
