import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { ApplicationDependency, Ecosystem } from '../types';
import Parser from './Parser';

const LOCKFILE_PACKAGE_REGEX =
  /^(?<org>[^:]*):(?<packageName>[^:]*):(?<version>[^=]*)=(?<classpaths>.*)/;
const createGradlefileRegex = (org: string, packageName: string) =>
  new RegExp(
    `.*implementation\\s+['"]{1}${org.replace(
      '.',
      '\\.'
    )}\\:${packageName.replace('.', '\\.')}\\:.*`,
    'gmi'
  );

export default class GradleParser implements Parser {
  private async parseLockfile(
    filepath: string
  ): Promise<ApplicationDependency[]> {
    const contents = fs.readFileSync(filepath).toString();
    const parsed: ApplicationDependency[] = [];
    contents.split('\n').forEach((line) => {
      const gradleFile = fs
        .readFileSync(`${path.dirname(filepath)}/build.gradle`)
        .toString();
      const match = line.match(LOCKFILE_PACKAGE_REGEX);
      if (match && match.groups) {
        const directDependencyMatch = gradleFile.match(
          createGradlefileRegex(match.groups.org, match.groups.packageName)
        );
        if (directDependencyMatch) {
          parsed.push({
            ecosystem: 'gradle',
            environment: /implementation/.test(directDependencyMatch[0])
              ? 'application'
              : 'development',
            source: filepath,
            isForked: false,
            version: match.groups.version,
            packageName: `${match.groups.org}:${match.groups.packageName}`,
          });
        }
      }
    });
    return parsed;
  }

  private getAllLockfileFilepaths(projectRoot: string): string[] {
    const files = glob.sync(`${projectRoot}/**/gradle.lockfile`);
    return files;
  }

  getEcosystem(): Ecosystem {
    return 'gradle';
  }

  async getDependencies(projectRoot: string): Promise<ApplicationDependency[]> {
    const requirementsFiles = this.getAllLockfileFilepaths(projectRoot);
    const dependencies: ApplicationDependency[] = [];
    for await (const file of requirementsFiles) {
      const deps = await this.parseLockfile(file);
      for (const dep of deps) {
        const existingDep = dependencies.find(
          (d) =>
            d.packageName === dep.packageName &&
            d.version === dep.version &&
            d.isForked === dep.isForked
        );
        if (
          existingDep &&
          existingDep.environment !== 'application' &&
          dep.environment === 'application'
        ) {
          existingDep.environment = 'application';
          existingDep.source = dep.source;
        } else if (!existingDep) {
          dependencies.push(dep);
        }
      }
    }

    return dependencies;
  }
}
