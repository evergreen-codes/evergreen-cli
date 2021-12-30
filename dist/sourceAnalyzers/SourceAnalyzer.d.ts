import { Ecosystem } from '../types';
export default abstract class SourceAnalyzer {
    sourceCache: Record<string, string[]>;
    abstract getEcosystem(): Ecosystem;
    abstract getSourceRegexesForPackage(packageName: string): RegExp[] | null;
    private getSource;
    countOccurances(packageName: string, projectRoot: string, sourceGlob: string): Promise<number>;
}
