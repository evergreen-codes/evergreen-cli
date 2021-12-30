import { ApplicationDependency, Ecosystem } from '../types';
export default abstract class Parser {
    abstract getEcosystem(): Ecosystem;
    abstract getDependencies(projectRoot: string): Promise<ApplicationDependency[]>;
}
