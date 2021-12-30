import { ApplicationDependency, Ecosystem } from '../types';
import Parser from './Parser';
export default class GradleParser implements Parser {
    private parseLockfile;
    private getAllLockfileFilepaths;
    getEcosystem(): Ecosystem;
    getDependencies(projectRoot: string): Promise<ApplicationDependency[]>;
}
