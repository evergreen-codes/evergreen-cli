import { Ecosystem } from '../types';
import SourceAnalyzer from './SourceAnalyzer';

export default class CocoaPodsSourceAnalyzer extends SourceAnalyzer {
  getEcosystem(): Ecosystem {
    return 'cocoapods';
  }

  getSourceRegexesForPackage(packageName: string): RegExp[] {
    return [new RegExp(`import <?${packageName}`, 'mgi')];
  }
}
