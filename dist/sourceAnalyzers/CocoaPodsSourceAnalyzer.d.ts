import { Ecosystem } from '../types';
import SourceAnalyzer from './SourceAnalyzer';
export default class CocoaPodsSourceAnalyzer extends SourceAnalyzer {
    getEcosystem(): Ecosystem;
    getSourceRegexesForPackage(packageName: string): RegExp[];
}
