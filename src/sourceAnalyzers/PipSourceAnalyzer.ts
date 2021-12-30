import { Ecosystem } from '../types';
import SourceAnalyzer from './SourceAnalyzer';

export default class PipSourceAnalyzer extends SourceAnalyzer {
  getEcosystem(): Ecosystem {
    return 'pip';
  }

  getSourceRegexesForPackage(packageName: string): RegExp[] {
    return [new RegExp(`from ${packageName.replace(/-/g, '_')}(.| )`, 'mgi')];
  }
}
