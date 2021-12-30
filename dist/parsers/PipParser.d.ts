import { ApplicationDependency, Ecosystem } from '../types';
import Parser from './Parser';
export default class PipParser implements Parser {
    private parseRequirementsFile;
    private getAllRequirementsFilepaths;
    getEcosystem(): Ecosystem;
    getDependencies(projectRoot: string): Promise<ApplicationDependency[]>;
}
