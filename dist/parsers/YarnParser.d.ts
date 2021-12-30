import { ApplicationDependency, Ecosystem } from '../types';
import Parser from './Parser';
export default class YarnParser extends Parser {
    getEcosystem(): Ecosystem;
    private getLockfileDependencies;
    private getWorkspaceDependencies;
    private getAllWorkspaceDependencies;
    getDependencies(projectRoot: string): Promise<ApplicationDependency[]>;
}
