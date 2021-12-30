import { Ecosystem } from '../types';
import SourceAnalyzer from './SourceAnalyzer';

export default class GradleSourceAnalyzer extends SourceAnalyzer {
  getEcosystem(): Ecosystem {
    return 'gradle';
  }

  getSourceRegexesForPackage(packageName: string): RegExp[] {
    const [org, artifact] = packageName.split(':');
    const finalOrgPart = org.split('.').pop();
    const firstArtifactPart = artifact.split('-').shift();
    return [
      new RegExp(`import ${artifact}(.| )`, 'mgi'),
      new RegExp(`import ${firstArtifactPart}(.| )`, 'mgi'),
      new RegExp(`import ${finalOrgPart}(.)${firstArtifactPart}`, 'mgi'),
      new RegExp(`import ${finalOrgPart}(.| )`, 'mgi'),
    ];
  }
}
