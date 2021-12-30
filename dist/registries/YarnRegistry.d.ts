import { PackageInfo, Ecosystem } from '../types';
import Registry from './Registry';
export default class YarnRegistry extends Registry {
    getEcosystem(): Ecosystem;
    getPackageInfo(packageName: string, versions: string[]): Promise<PackageInfo>;
}
