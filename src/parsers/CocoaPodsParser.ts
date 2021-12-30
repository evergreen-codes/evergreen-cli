import { LockfileParser } from '@snyk/cocoapods-lockfile-parser';

import { ApplicationDependency, Ecosystem } from '../types';
import Parser from './Parser';

export default class CocoaPodsParser implements Parser {
  getEcosystem(): Ecosystem {
    return 'cocoapods';
  }

  async getDependencies(projectRoot: string): Promise<ApplicationDependency[]> {
    const lockfilePath = `${projectRoot}/Podfile.lock`;
    const parser = await LockfileParser.readFile(lockfilePath);
    const podfile = parser.toDepGraph().toJSON();
    const dependencies: Record<string, ApplicationDependency> = {};
    for (const pkg of podfile.pkgs) {
      const moreInfo = podfile.graph.nodes.find(
        (node) => node.pkgId === pkg.id
      );
      const isForked = Boolean(
        moreInfo &&
          moreInfo.info &&
          moreInfo.info.labels &&
          moreInfo.info.labels.externalSourceGit
      );

      // Exclude local packages
      if (
        pkg.info.name !== 'ios' &&
        !(
          moreInfo &&
          moreInfo.info &&
          moreInfo.info.labels &&
          moreInfo.info.labels.externalSourcePath
        )
      ) {
        const packageName = pkg.info.name.split('/')[0];
        dependencies[packageName] = {
          ...pkg.info,
          version: pkg.info.version || '',
          ecosystem: this.getEcosystem(),
          environment: 'application',
          source: lockfilePath,
          packageName,
          isForked,
        };
      }
    }

    return Object.values(dependencies);
  }
}
