import LibrariesIOClient from '../clients/LibrariesIOClient';
import { PackageInfo, Ecosystem } from '../types';
import Registry from './Registry';
export default class CocoaPodsRegistry extends Registry {
    librariesIOClient: LibrariesIOClient;
    getEcosystem(): Ecosystem;
    getPackageInfo(packageName: string): Promise<PackageInfo>;
}
