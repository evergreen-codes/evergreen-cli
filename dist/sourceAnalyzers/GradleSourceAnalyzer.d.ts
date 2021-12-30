import { Ecosystem } from '../types';
import SourceAnalyzer from './SourceAnalyzer';
export default class GradleSourceAnalyzer extends SourceAnalyzer {
    getEcosystem(): Ecosystem;
    getSourceRegexesForPackage(packageName: string): RegExp[];
}
