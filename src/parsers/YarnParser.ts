import * as path from 'path';
import * as fs from 'fs';
import * as lockfile from '@yarnpkg/lockfile';
import { ApplicationDependency, Ecosystem } from '../types';
import Parser from './Parser';
import { parsePackageJson, getWorkspacePaths } from '../utils/yarn';

type WorkspaceDependecies = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

type LockfileDependency = {
  version: string;
  isForked: boolean;
};

export default class YarnParser extends Parser {
  getEcosystem(): Ecosystem {
    return 'yarn';
  }

  private getLockfileDependencies(
    projectRoot: string
  ): Record<string, LockfileDependency[]> {
    const lockfilePath = path.join(projectRoot, 'yarn.lock');
    const file = fs.readFileSync(lockfilePath, 'utf8');
    const json = lockfile.parse(file);
    const dependencies: Record<string, LockfileDependency[]> = {};
    Object.keys(json.object).forEach((dep) => {
      const name = `${dep.startsWith('@') ? '@' : ''}${
        dep.split('@')[dep.split('@').length - 2]
      }`;
      if (!dependencies[name]) {
        dependencies[name] = [];
      }

      const version = json.object[dep].version;
      const isForked = !json.object[dep].integrity;
      const existingVersion = dependencies[name].find(
        (d) => d.version === version && d.isForked === isForked
      );
      if (!existingVersion) {
        dependencies[name].push({
          version: json.object[dep].version,
          isForked: !json.object[dep].integrity,
        });
      }
    });
    return dependencies;
  }

  private async getWorkspaceDependencies(
    workspacePath: string
  ): Promise<WorkspaceDependecies> {
    const packageJson = await parsePackageJson(
      path.join(workspacePath, 'package.json')
    );
    const { devDependencies = {}, dependencies = {} } = packageJson;
    return { dependencies, devDependencies };
  }

  private async getAllWorkspaceDependencies(
    projectRoot: string
  ): Promise<WorkspaceDependecies> {
    const workspacePaths = await getWorkspacePaths(projectRoot);
    let dependencies = await this.getWorkspaceDependencies(projectRoot);
    for await (const workspacePath of workspacePaths) {
      const workspaceDependencies = await this.getWorkspaceDependencies(
        workspacePath
      );
      dependencies = {
        dependencies: {
          ...dependencies.dependencies,
          ...workspaceDependencies.dependencies,
        },
        devDependencies: {
          ...dependencies.devDependencies,
          ...workspaceDependencies.devDependencies,
        },
      };
    }

    return dependencies;
  }

  async getDependencies(projectRoot: string): Promise<ApplicationDependency[]> {
    const workspaceDependencies = await this.getAllWorkspaceDependencies(
      projectRoot
    );
    const lockfileDependencies = await this.getLockfileDependencies(
      projectRoot
    );
    const applicationDependencies: ApplicationDependency[] = [];

    Object.keys(lockfileDependencies).forEach((packageName) => {
      const isApplicationDependency =
        workspaceDependencies.dependencies[packageName];
      const isDevDependency =
        workspaceDependencies.devDependencies[packageName];
      const directDependency = isApplicationDependency || isDevDependency;
      if (directDependency) {
        lockfileDependencies[packageName].forEach((lockfileDependency) => {
          applicationDependencies.push({
            ecosystem: 'yarn',
            environment: isApplicationDependency
              ? 'application'
              : 'development',
            source: path.join(projectRoot, 'yarn.lock'),
            packageName,
            version: lockfileDependency.version,
            isForked: lockfileDependency.isForked,
          });
        });
      }
    });

    return applicationDependencies;
  }
}
