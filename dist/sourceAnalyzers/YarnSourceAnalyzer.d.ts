import { Ecosystem } from '../types';
import SourceAnalyzer from './SourceAnalyzer';
export default class YarnSourceAnalyzer extends SourceAnalyzer {
    private usagesCache;
    private getUsages;
    getEcosystem(): Ecosystem;
    getSourceRegexesForPackage(): null;
    countOccurances(packageName: string, projectRoot: string): Promise<number>;
}
