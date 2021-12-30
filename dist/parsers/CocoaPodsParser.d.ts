import { ApplicationDependency, Ecosystem } from '../types';
import Parser from './Parser';
export default class CocoaPodsParser implements Parser {
    getEcosystem(): Ecosystem;
    getDependencies(projectRoot: string): Promise<ApplicationDependency[]>;
}
